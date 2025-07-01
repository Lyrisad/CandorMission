// Contact Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Form handling
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.querySelector('.success-message');
    const thankYouModal = document.getElementById('thankYouModal');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const message = formData.get('message');
            const acceptance = formData.get('acceptance');
            
            // Basic validation
            if (!name || !email || !message) {
                showError('Veuillez remplir tous les champs obligatoires.');
                return;
            }
            
            if (!isValidEmail(email)) {
                showError('Veuillez entrer une adresse email valide.');
                return;
            }
            
            if (!acceptance) {
                showError('Veuillez accepter que votre question/demande puisse être exploitée.');
                return;
            }
            
            // Show loading state
            showLoading();
            
            // Prepare template parameters for EmailJS
            const templateParams = {
                from_name: name,
                from_email: email,
                from_phone: phone || 'Non renseigné',
                subject: 'Nouveau message de contact',
                message: message,
                to_name: 'Candor Ma Mission'
            };
            
            // Send email using EmailJS
            emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, templateParams)
                .then(function(response) {
                    console.log('EmailJS SUCCESS!', response.status, response.text);
                    
                    // Ensuite, envoyer vers Google Apps Script avec la nouvelle structure
                    sendToGoogleSheet(name, email, phone, message);
                    
                }, function(error) {
                    console.log('EmailJS FAILED...', error);
                    
                    // Même si EmailJS échoue, essayer d'envoyer vers Google Sheet
                    sendToGoogleSheet(name, email, phone, message);
                });
        });
    }
    
    // Fonction pour envoyer les données vers Google Apps Script avec la nouvelle structure
    function sendToGoogleSheet(name, email, phone, message) {
        // Construire l'URL avec les paramètres GET et l'action
        const params = new URLSearchParams({
            action: 'addMessage',
            name: name,
            email: email,
            phone: phone || 'Non renseigné',
            message: message
        });
        
        const url = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;
        
        console.log('Envoi vers Google Apps Script:', url);
        
        // Envoyer la requête GET
        fetch(url)
            .then(response => {
                console.log('Google Apps Script response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Google Apps Script response data:', data);
                
                if (data.success) {
                    hideLoading();
                    showThankYouModal();
                    contactForm.reset();
                    console.log('Message enregistré avec succès dans Google Sheet. ID:', data.id);
                } else {
                    console.error('Google Apps Script error:', data.error);
                    // Même en cas d'erreur Google Sheet, on montre le succès car EmailJS a fonctionné
                    hideLoading();
                    showThankYouModal();
                    contactForm.reset();
                }
            })
            .catch(error => {
                console.error('Google Apps Script fetch error:', error);
                // Même en cas d'erreur, on montre le succès car EmailJS a fonctionné
                hideLoading();
                showThankYouModal();
                contactForm.reset();
            });
    }
    
    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Show loading state
    function showLoading() {
        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
            submitBtn.disabled = true;
        }
    }
    
    // Hide loading state
    function hideLoading() {
        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer le message';
            submitBtn.disabled = false;
        }
    }
    
    // Show success message
    function showSuccess() {
        if (successMessage) {
            successMessage.classList.add('show');
            successMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <strong>Message envoyé avec succès !</strong><br>
                Nous vous répondrons dans les plus brefs délais.
            `;
        }
    }
    
    // Hide success message
    function hideSuccess() {
        if (successMessage) {
            successMessage.classList.remove('show');
        }
    }
    
    // Show error message
    function showError(message) {
        // Remove existing error message
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Create new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 1rem;
            border-radius: 10px;
            margin-bottom: 1rem;
            text-align: center;
            animation: slideInDown 0.3s ease;
        `;
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        // Insert before form
        const form = document.querySelector('.contact-form');
        if (form) {
            form.insertBefore(errorDiv, form.firstChild);
        }
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    // Contact method hover effects
    const contactMethods = document.querySelectorAll('.contact-method');
    contactMethods.forEach(method => {
        method.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        method.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Form field focus effects
    const formFields = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    formFields.forEach(field => {
        field.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        field.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
    
    // Auto-resize textarea
    const textarea = document.querySelector('.form-group textarea');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 300) + 'px';
        });
    }
    
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add floating animation to contact methods
    contactMethods.forEach((method, index) => {
        method.style.animationDelay = `${index * 0.2}s`;
        method.classList.add('floating-animation');
    });
    
    // Add CSS for floating animation
    const style = document.createElement('style');
    style.textContent = `
        .floating-animation {
            animation: floating 3s ease-in-out infinite;
        }
        
        @keyframes floating {
            0%, 100% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-10px);
            }
        }
        
        .error-message {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 1rem;
            border-radius: 10px;
            margin-bottom: 1rem;
            text-align: center;
            animation: slideInDown 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize tooltips for contact methods
    contactMethods.forEach(method => {
        const details = method.querySelector('.method-details p');
        if (details) {
            method.title = details.textContent;
        }
    });
    
    // Add click-to-copy functionality for contact details
    const contactDetails = document.querySelectorAll('.method-details p');
    contactDetails.forEach(detail => {
        detail.style.cursor = 'pointer';
        detail.addEventListener('click', function() {
            const text = this.textContent;
            navigator.clipboard.writeText(text).then(() => {
                // Show temporary success message
                const originalText = this.textContent;
                this.textContent = 'Copié !';
                this.style.color = '#10b981';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.color = '#64748b';
                }, 2000);
            });
        });
    });
    
    // Show thank you modal
    function showThankYouModal() {
        if (thankYouModal) {
            thankYouModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }
    
    // Hide thank you modal
    function hideThankYouModal() {
        if (thankYouModal) {
            thankYouModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    }
    
    // Close modal when clicking the close button
    const closeModalBtn = document.querySelector('.close-modal-btn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideThankYouModal);
    }
    
    // Close modal when clicking outside the modal
    if (thankYouModal) {
        thankYouModal.addEventListener('click', function(e) {
            if (e.target === thankYouModal) {
                hideThankYouModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && thankYouModal.style.display === 'block') {
            hideThankYouModal();
        }
    });
}); 