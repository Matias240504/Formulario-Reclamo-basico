// Cargar productos al cargar la página
document.addEventListener('DOMContentLoaded', async function() {
    await loadProducts();
});

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
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
}

document.getElementById('supportForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Obtener datos del formulario
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        product: document.getElementById('product').value,
        issueType: document.getElementById('issueType').value,
        message: document.getElementById('message').value
    };
    
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
            alert('¡Gracias por contactarnos! Hemos recibido tu mensaje y nos pondremos en contacto contigo pronto.');
            this.reset();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error enviando formulario:', error);
        alert('Error al enviar el formulario. Por favor, inténtalo de nuevo.');
    } finally {
        // Rehabilitar el botón
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});