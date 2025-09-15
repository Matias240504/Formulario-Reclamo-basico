document.getElementById('supportForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Obtener datos del formulario
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
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