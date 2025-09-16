// Cargar productos al cargar la página
document.addEventListener('DOMContentLoaded', async function() {
    await loadProducts();
    setupProductChangeHandler();
    setupIssueTypeChangeHandler();
    setupAdminButton();
});

// Configurar botón de administrador
function setupAdminButton() {
    const adminButton = document.getElementById('adminButton');
    if (adminButton) {
        adminButton.addEventListener('click', function() {
            showAdminAuthModal();
        });
    }
    
    // Configurar modal de autenticación
    setupAdminAuthModal();
}

// Configurar modal de autenticación de administrador
function setupAdminAuthModal() {
    const modal = document.getElementById('adminAuthModal');
    const closeBtn = document.getElementById('adminModalClose');
    const cancelBtn = document.getElementById('adminAuthCancel');
    const form = document.getElementById('adminAuthForm');
    
    // Cerrar modal
    closeBtn.addEventListener('click', closeAdminAuthModal);
    cancelBtn.addEventListener('click', closeAdminAuthModal);
    
    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeAdminAuthModal();
        }
    });
    
    // Manejar envío del formulario
    form.addEventListener('submit', handleAdminAuth);
}

// Mostrar modal de autenticación
function showAdminAuthModal() {
    const modal = document.getElementById('adminAuthModal');
    const passwordInput = document.getElementById('adminPassword');
    const errorDiv = document.getElementById('authError');
    
    // Limpiar formulario
    passwordInput.value = '';
    errorDiv.style.display = 'none';
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Enfocar el input de contraseña
    setTimeout(() => {
        passwordInput.focus();
    }, 100);
}

// Cerrar modal de autenticación
function closeAdminAuthModal() {
    const modal = document.getElementById('adminAuthModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Manejar autenticación de administrador
async function handleAdminAuth(e) {
    e.preventDefault();
    
    const password = document.getElementById('adminPassword').value;
    const submitBtn = e.target.querySelector('.auth-submit-btn');
    const errorDiv = document.getElementById('authError');
    const originalText = submitBtn.textContent;
    
    // Deshabilitar botón y mostrar loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verificando...';
    errorDiv.style.display = 'none';
    
    try {
        const response = await fetch('/api/support/admin/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Autenticación exitosa
            closeAdminAuthModal();
            window.location.href = 'admin.html';
        } else {
            // Mostrar error
            showAuthError(result.message);
        }
    } catch (error) {
        console.error('Error de autenticación:', error);
        showAuthError('Error de conexión. Inténtalo de nuevo.');
    } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Mostrar error de autenticación
function showAuthError(message) {
    const errorDiv = document.getElementById('authError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Limpiar contraseña
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminPassword').focus();
}

// Función para cargar productos desde la API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const result = await response.json();
        
        if (result.success) {
            const productSelect = document.getElementById('product');
            
            // Limpiar opciones existentes (excepto la primera)
            productSelect.innerHTML = '<option value="">Seleccione un producto</option>';
            
            // Agrupar productos por categoría
            const productsByCategory = {};
            result.data.forEach(product => {
                if (!productsByCategory[product.category]) {
                    productsByCategory[product.category] = [];
                }
                productsByCategory[product.category].push(product);
            });
            
            // Crear optgroups por categoría
            Object.keys(productsByCategory).sort().forEach(category => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = category;
                
                productsByCategory[category].forEach(product => {
                    const option = document.createElement('option');
                    option.value = product._id;
                    option.textContent = `${product.name} ${product.version ? '(' + product.version + ')' : ''} - $${product.price}`;
                    optgroup.appendChild(option);
                });
                
                productSelect.appendChild(optgroup);
            });
            
            // Agregar la opción "Otro" al final
            const otherOption = document.createElement('option');
            otherOption.value = 'other';
            otherOption.textContent = 'Otro (producto personalizado)';
            productSelect.appendChild(otherOption);
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
}

// Configurar el manejador de cambio de producto
function setupProductChangeHandler() {
    const productSelect = document.getElementById('product');
    const customProductFields = document.getElementById('customProductFields');
    
    productSelect.addEventListener('change', function() {
        if (this.value === 'other') {
            customProductFields.style.display = 'block';
            // Hacer campos requeridos cuando se muestra
            setCustomProductFieldsRequired(true);
        } else {
            customProductFields.style.display = 'none';
            // Quitar requerimiento cuando se oculta
            setCustomProductFieldsRequired(false);
            // Limpiar campos
            clearCustomProductFields();
        }
    });
}

// Función para establecer campos requeridos
function setCustomProductFieldsRequired(required) {
    const requiredFields = [
        'customProductName',
        'customProductCategory', 
        'customProductDescription',
        'customProductManufacturer',
        'customProductSupportLevel'
    ];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.required = required;
        }
    });
}

// Función para limpiar campos personalizados
function clearCustomProductFields() {
    const fields = [
        'customProductName',
        'customProductCategory',
        'customProductVersion',
        'customProductDescription',
        'customProductManufacturer',
        'customProductPrice',
        'customProductSupportLevel'
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = '';
        }
    });
}

// Configurar el manejador de cambio de tipo de problema
function setupIssueTypeChangeHandler() {
    const issueTypeSelect = document.getElementById('issueType');
    const productSection = document.getElementById('productSection');
    const productSelect = document.getElementById('product');
    
    issueTypeSelect.addEventListener('change', function() {
        if (this.value === 'hardware') {
            productSection.style.display = 'block';
            productSelect.required = true;
        } else {
            productSection.style.display = 'none';
            productSelect.required = false;
            // Limpiar selección de producto
            productSelect.value = '';
            // Ocultar campos personalizados si estaban visibles
            const customProductFields = document.getElementById('customProductFields');
            customProductFields.style.display = 'none';
            setCustomProductFieldsRequired(false);
            clearCustomProductFields();
        }
    });
}

document.getElementById('supportForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Obtener datos del formulario
    let formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        issueType: document.getElementById('issueType').value,
        message: document.getElementById('message').value
    };
    
    // Solo incluir producto si el tipo de problema es hardware
    if (formData.issueType === 'hardware') {
        formData.product = document.getElementById('product').value;
        
        // Si se seleccionó "otro", incluir datos del producto personalizado
        if (formData.product === 'other') {
            formData.customProduct = {
                name: document.getElementById('customProductName').value,
                category: document.getElementById('customProductCategory').value,
                version: document.getElementById('customProductVersion').value || '',
                description: document.getElementById('customProductDescription').value,
                manufacturer: document.getElementById('customProductManufacturer').value,
                price: parseFloat(document.getElementById('customProductPrice').value) || 0,
                supportLevel: document.getElementById('customProductSupportLevel').value
            };
        }
    }
    
    // Deshabilitar el botón de envío
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';
    
    try {
        // Enviar datos al backend
        const response = await fetch('/api/support/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccessMessage('¡Gracias por contactarnos! Hemos recibido tu mensaje y nos pondremos en contacto contigo pronto.');
            this.reset();
            // Reiniciar animaciones de los form-groups
            setTimeout(() => {
                const formGroups = document.querySelectorAll('.form-group');
                formGroups.forEach((group, index) => {
                    group.style.animation = 'none';
                    group.offsetHeight; // Trigger reflow
                    group.style.animation = `formGroupSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both`;
                    group.style.animationDelay = `${(index + 1) * 0.1}s`;
                });
            }, 100);
        } else {
            showErrorMessage('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error enviando formulario:', error);
        showErrorMessage('Error al enviar el formulario. Por favor, inténtalo de nuevo.');
    } finally {
        // Rehabilitar el botón
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});

// Funciones para mostrar mensajes de éxito y error con animaciones
function showSuccessMessage(message) {
    // Remover mensajes existentes
    removeExistingMessages();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    
    const form = document.getElementById('supportForm');
    form.appendChild(messageDiv);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'fadeOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 400);
        }
    }, 5000);
}

function showErrorMessage(message) {
    // Remover mensajes existentes
    removeExistingMessages();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'error-message';
    messageDiv.textContent = message;
    
    const form = document.getElementById('supportForm');
    form.appendChild(messageDiv);
    
    // Auto-remover después de 6 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'fadeOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 400);
        }
    }, 6000);
}

function removeExistingMessages() {
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => {
        msg.style.animation = 'fadeOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => {
            if (msg.parentNode) {
                msg.remove();
            }
        }, 300);
    });
}