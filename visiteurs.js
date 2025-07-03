// Gestion des visiteurs pour la page d'accueil
// Ce script doit être inclus uniquement dans index.html

(function() {
    'use strict';
    
    // URL de votre Google Apps Script déployé
    // IMPORTANT: Remplacez cette URL par celle de votre Apps Script déployé
    // Vous la trouverez après avoir déployé votre script Google Apps Script
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxCTEVhtUW2NWRlkdj5PsHd6Oxvejw8b0_SqOuAECemWMYUBtQUyY_sO__Ddhrh-BOYIA/exec';
    
    /**
     * Vérifie si le visiteur a déjà été compté aujourd'hui
     */
    function hasVisitedToday() {
        const today = new Date().toDateString();
        const lastVisit = localStorage.getItem('candor_last_visit');
        return lastVisit === today;
    }
    
    /**
     * Marque le visiteur comme ayant visité aujourd'hui
     */
    function markVisitedToday() {
        const today = new Date().toDateString();
        localStorage.setItem('candor_last_visit', today);
    }
    
    /**
     * Enregistre une nouvelle visite
     */
    function trackVisitor() {
        // Vérifier si déjà visité aujourd'hui
        if (hasVisitedToday()) {
            console.log('Visiteur déjà compté aujourd\'hui');
            return;
        }
        
        // Créer l'URL avec les paramètres
        const url = `${SCRIPT_URL}?action=trackVisitor&timestamp=${Date.now()}`;
        
        // Utiliser fetch avec mode no-cors pour éviter les problèmes CORS
        fetch(url, {
            method: 'GET',
            mode: 'no-cors'
        })
        .then(() => {
            // Marquer comme visité aujourd'hui
            markVisitedToday();
            console.log('Visite enregistrée avec succès');
        })
        .catch(error => {
            console.warn('Erreur lors de l\'enregistrement de la visite:', error);
            // Marquer quand même comme visité pour éviter les tentatives répétées
            markVisitedToday();
        });
    }
    
    /**
     * Initialise le tracking des visiteurs
     */
    function initVisitorTracking() {
        // Attendre que la page soit complètement chargée
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', trackVisitor);
        } else {
            // Page déjà chargée
            trackVisitor();
        }
    }
    
    // Lancer le tracking quand le script est chargé
    initVisitorTracking();
    
})(); 