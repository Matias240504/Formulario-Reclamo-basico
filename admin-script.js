// Variables globales
let currentTickets = [];
let currentFilters = {};

// Cargar dashboard al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    loadTickets();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Botón de actualizar
    document.getElementById('refreshBtn').addEventListener('click', loadTickets);
    
    // Botón de volver
    document.getElementById('backBtn').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    // Filtros
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('issueTypeFilter').addEventListener('change', applyFilters);
    
    // Modal
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalCancel').addEventListener('click', closeModal);
    document.getElementById('updateStatusBtn').addEventListener('click', updateTicketStatus);
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('ticketModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// Cargar tickets desde la API
async function loadTickets() {
    try {
        showLoading(true);
        
        const queryParams = new URLSearchParams(currentFilters);
        const response = await fetch(`/api/support/tickets?${queryParams}`);
        const result = await response.json();
        
        if (result.success) {
            currentTickets = result.data;
            updateStats(result.stats);
            renderTickets(result.data);
        } else {
            showError('Error cargando tickets: ' + result.message);
        }
    } catch (error) {
        console.error('Error cargando tickets:', error);
        showError('Error de conexión al cargar tickets');
    } finally {
        showLoading(false);
    }
}

// Aplicar filtros
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const issueTypeFilter = document.getElementById('issueTypeFilter').value;
    
    currentFilters = {};
    if (statusFilter) currentFilters.status = statusFilter;
    if (issueTypeFilter) currentFilters.issueType = issueTypeFilter;
    
    loadTickets();
}

// Actualizar estadísticas
function updateStats(stats) {
    document.getElementById('totalTickets').textContent = stats.total;
    document.getElementById('openTickets').textContent = stats.open;
    document.getElementById('todayTickets').textContent = stats.today;
}

// Renderizar tickets
function renderTickets(tickets) {
    const container = document.getElementById('ticketsContainer');
    const noTicketsDiv = document.getElementById('noTickets');
    
    if (tickets.length === 0) {
        container.innerHTML = '';
        noTicketsDiv.style.display = 'block';
        return;
    }
    
    noTicketsDiv.style.display = 'none';
    
    container.innerHTML = tickets.map((ticket, index) => `
        <div class="ticket-card" onclick="openTicketModal('${ticket._id}')" style="animation-delay: ${index * 0.1}s">
            <div class="ticket-header">
                <div class="ticket-id">#${ticket._id.slice(-8)}</div>
                <div class="ticket-status status-${ticket.status}">${getStatusLabel(ticket.status)}</div>
            </div>
            
            <div class="ticket-info">
                <div class="ticket-name">${escapeHtml(ticket.name)}</div>
                <div class="ticket-email">${escapeHtml(ticket.email)}</div>
                <div class="ticket-type">${getIssueTypeLabel(ticket.issueType)}</div>
                <div class="ticket-message">${escapeHtml(ticket.message)}</div>
            </div>
            
            <div class="ticket-footer">
                <div class="ticket-date">${formatDate(ticket.createdAt)}</div>
                ${ticket.product ? `<div class="ticket-product">${escapeHtml(ticket.product.name)}</div>` : ''}
            </div>
        </div>
    `).join('');
}

// Abrir modal de ticket
async function openTicketModal(ticketId) {
    try {
        const response = await fetch(`/api/support/tickets/${ticketId}`);
        const result = await response.json();
        
        if (result.success) {
            const ticket = result.data;
            showTicketModal(ticket);
        } else {
            showError('Error cargando detalles del ticket');
        }
    } catch (error) {
        console.error('Error cargando ticket:', error);
        showError('Error de conexión');
    }
}

// Mostrar modal con detalles del ticket
function showTicketModal(ticket) {
    const modal = document.getElementById('ticketModal');
    const modalBody = document.getElementById('modalBody');
    const statusSelect = document.getElementById('statusUpdate');
    
    document.getElementById('modalTitle').textContent = `Ticket #${ticket._id.slice(-8)}`;
    
    modalBody.innerHTML = `
        <div class="ticket-detail">
            <div class="detail-section">
                <h4>Información del Usuario</h4>
                <p><strong>Nombre:</strong> ${escapeHtml(ticket.name)}</p>
                <p><strong>Email:</strong> ${escapeHtml(ticket.email)}</p>
            </div>
            
            <div class="detail-section">
                <h4>Detalles del Problema</h4>
                <p><strong>Tipo:</strong> ${getIssueTypeLabel(ticket.issueType)}</p>
                <p><strong>Estado:</strong> <span class="ticket-status status-${ticket.status}">${getStatusLabel(ticket.status)}</span></p>
                ${ticket.product ? `<p><strong>Producto:</strong> ${escapeHtml(ticket.product.name)} ${ticket.product.version ? `(${ticket.product.version})` : ''}</p>` : ''}
            </div>
            
            <div class="detail-section">
                <h4>Mensaje</h4>
                <div class="message-content">${escapeHtml(ticket.message).replace(/\n/g, '<br>')}</div>
            </div>
            
            <div class="detail-section">
                <h4>Fechas</h4>
                <p><strong>Creado:</strong> ${formatDateTime(ticket.createdAt)}</p>
                <p><strong>Actualizado:</strong> ${formatDateTime(ticket.updatedAt)}</p>
            </div>
        </div>
    `;
    
    // Establecer estado actual en el select
    statusSelect.value = ticket.status;
    statusSelect.dataset.ticketId = ticket._id;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Cerrar modal
function closeModal() {
    const modal = document.getElementById('ticketModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Actualizar estado del ticket
async function updateTicketStatus() {
    const statusSelect = document.getElementById('statusUpdate');
    const ticketId = statusSelect.dataset.ticketId;
    const newStatus = statusSelect.value;
    
    try {
        const response = await fetch(`/api/support/tickets/${ticketId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Estado actualizado correctamente');
            closeModal();
            loadTickets(); // Recargar tickets
        } else {
            showError('Error actualizando estado: ' + result.message);
        }
    } catch (error) {
        console.error('Error actualizando estado:', error);
        showError('Error de conexión al actualizar estado');
    }
}

// Funciones de utilidad
function getStatusLabel(status) {
    const labels = {
        'open': 'Abierto',
        'in_progress': 'En Progreso',
        'resolved': 'Resuelto',
        'closed': 'Cerrado'
    };
    return labels[status] || status;
}

function getIssueTypeLabel(type) {
    const labels = {
        'technical': 'Técnico',
        'billing': 'Facturación',
        'account': 'Cuenta',
        'feature': 'Nueva Función',
        'hardware': 'Hardware',
        'other': 'Otro'
    };
    return labels[type] || type;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    const container = document.getElementById('ticketsContainer');
    
    if (show) {
        spinner.style.display = 'flex';
        container.style.display = 'none';
    } else {
        spinner.style.display = 'none';
        container.style.display = 'grid';
    }
}

function showError(message) {
    // Crear notificación de error
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">⚠️</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

function showSuccess(message) {
    // Crear notificación de éxito
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✅</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Agregar estilos para notificaciones
const notificationStyles = `
<style>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    max-width: 400px;
}

.notification.error {
    border-left: 4px solid #ef4444;
}

.notification.success {
    border-left: 4px solid #10b981;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.notification-message {
    color: #374151;
    font-weight: 500;
    font-size: 14px;
}

@keyframes slideIn {
    0% {
        opacity: 0;
        transform: translateX(100%);
    }
    100% {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideOut {
    0% {
        opacity: 1;
        transform: translateX(0);
    }
    100% {
        opacity: 0;
        transform: translateX(100%);
    }
}

.detail-section {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;
}

.detail-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.detail-section h4 {
    color: #1e40af;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
}

.detail-section p {
    margin-bottom: 8px;
    color: #374151;
    line-height: 1.5;
}

.message-content {
    background: #f9fafb;
    padding: 16px;
    border-radius: 8px;
    color: #374151;
    line-height: 1.6;
    white-space: pre-wrap;
}
</style>
`;

// Agregar estilos al head
document.head.insertAdjacentHTML('beforeend', notificationStyles);
