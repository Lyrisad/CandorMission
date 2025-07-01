// Configuration globale pour Candor Ma Mission
// Fichier de configuration centralisé pour éviter la duplication d'URLs

// URL du Google Apps Script (à modifier ici uniquement)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxB8Y2y17rgPSsnqYSyeBYnq_VsHD5e6yVY7g489XkUiE-wCP-lyIdRhYsJWypBbazW/exec';

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