// Configuration globale pour Candor Ma Mission
// Fichier de configuration centralisé pour éviter la duplication d'URLs

// URL du Google Apps Script (à modifier ici uniquement)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwwlu6wIZofSn1YJLAeXU5OBntejfSeLLVJuHRFvYwmwPMq1Z9rGDmfdMEnbNrLwb1C8Q/exec';

// Configuration EmailJS
const EMAILJS_CONFIG = {
    serviceId: 'service_x5g594z',
    templateId: 'template_vca49gf',
    publicKey: '4sYz-WzrDCXInmUCl'
};

// Configuration du site
const SITE_CONFIG = {
    name: 'Candor Ma Mission',
    description: 'Transformez votre vision en réalité',
    contact: {
        phone: '+33 2 32 63 43 10',
        email: 'candormamission@groupecandor.fr',
        address: '9001 Av. des Métiers, 27100 Val-de-Reuil, France'
    }
};

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GOOGLE_SCRIPT_URL,
        EMAILJS_CONFIG,
        SITE_CONFIG
    };
} 