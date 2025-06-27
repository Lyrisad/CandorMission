// Effet holographique interactif pour les cartes
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.pokemon-card');
    const modal = document.getElementById('cardModal');
    const modalCard = document.getElementById('modalCard');
    const modalClose = document.getElementById('modalClose');
    
    // Données des membres de l'équipe
    const teamMembers = {
        'CC.gif': {
            name: 'KUSOSKY David',
            title: 'Captain CAMPUS',
            description: 'Maître du transfert de connaissance télépathique, Captain Campus forme les esprits à la vitesse de la pensée. Responsable d\'un centre de formation dans la propreté, il transmet son savoir avec précision, rendant chaque agent plus rapide, plus compétent, plus conscient des enjeux d\'hygiène. Grâce à lui, l\'excellence professionnelle devient instantanée.',
            experience: 'Responsable de Campus',
            specialty: 'Transfert de connaissance'
        },
        'Dorian.gif': {
            name: 'MARNE Dorian',
            title: 'GARDIEN DE LA SECURITE',
            description: 'Coordinateur QSE au sein du groupe Candor, il veille à instaurer un environnement de travail sûr et conforme pour tous. Doté d\'un sens aigu de l\'anticipation, il identifie et prévient les risques avant qu\'ils ne deviennent des urgences, garantissant ainsi la protection des collaborateurs et la qualité des interventions. Sa vigilance constante et son expertise font de lui un pilier indispensable pour assurer la sécurité et la sérénité au quotidien.',
            experience: 'Coordinateur QSE',
            specialty: 'Anticipe l\'urgence avant qu\'elle n\'arrive'
        },
        'Angelique.gif': {
            name: 'DUBOIS Angélique',
            title: 'The PayGuardian',
            description: 'Gestionnaire de paie experte au sein du groupe Candor, elle assure avec précision et vigilance la bonne gestion des salaires. Véritable gardienne de la justice salariale, elle s\'assure que chaque collaborateur soit rémunéré équitablement et que toutes les procédures respectent les normes en vigueur. Son rôle, tel un bouclier invisible, protège l\'entreprise et les salariés, garantissant transparence et conformité dans la gestion de la paie.',
            experience: 'Gestionnaire paie',
            specialty: 'Elle veille à la justice salariale et à la conformité, tel un bouclier invisible autour de la paie'
        },
        'Nathalie.gif': {
            name: 'CREUSAT Nathalie',
            title: 'WONDER MANAGEUSE',
            description: 'Responsable clientèle au sein du groupe Candor, elle fait preuve d\'un engagement sans faille pour résoudre les réclamations clients et relever les défis sur ses chantiers. Véritable pilier de son équipe, elle veille au bien-être de ses collaborateurs tout en garantissant un service de qualité irréprochable. Grâce à sa détermination et son sens du dialogue, elle assure la satisfaction client tout en maintenant un environnement de travail harmonieux.',
            experience: 'Responsable clientèle',
            specialty: 'Combat les réclamations, résout les problèmes et veille au bien être'
        },
        'Damien.gif': {
            name: 'DELAUNAY Damien',
            title: 'LOGISTIIK',
            description: 'Chef d\'équipe au sein du groupe Candor, LOGISTIIK excelle dans la gestion du planning et l\'organisation des interventions. Grâce à sa rapidité de déplacement et sa grande polyvalence, il est toujours prêt à intervenir pour coordonner ses équipes, anticiper les imprévus et réparer les problèmes techniques qui peuvent survenir. Véritable maître de la logistique opérationnelle, il garantit le bon déroulement des chantiers avec efficacité et rigueur.',
            experience: 'Chef d\'équipe',
            specialty: 'Maitre du planning, roi du déplacement rapide et réparateur universel'
        },
        'Jennifer.gif': {
            name: 'ROGER Jennifer',
            title: 'LADY BACTERIE',
            description: 'Dotée d\'une vision microscopique, Lady Bactérie traque la moindre impureté invisible à l\'œil nu. Responsable clientèle dans le secteur de la propreté, elle veille à l\'hygiène parfaite des lieux qu\'elle protège, anticipant chaque menace bactérienne avant même qu\'elle n\'apparaisse. Rien ne lui échappe, pas même un microbe en cavale.',
            experience: 'Responsable clientèle',
            specialty: 'Vision microscopique'
        },
        'Frank.gif': {
            name: 'OGER Franck',
            title: 'CLEANMAN',
            description: 'Directeur d\'exploitation du groupe Candor et expert des métiers de la propreté, CLEANMAN est le garant de la qualité et de l\'efficacité opérationnelle. Derrière son rôle de leader discret, surnommé "Le Nettoyeur Masqué", il agit en coulisses pour optimiser les process, piloter les équipes et s\'assurer que chaque chantier soit réalisé avec excellence. Sa vision stratégique et son engagement sans faille permettent à Candor de rester un acteur fiable et innovant dans son secteur, tout en inspirant confiance à ses collaborateurs et clients.',
            experience: 'Directeur d\'exploitation',
            specialty: 'Le Nettoyeur Masqué'
        },
        'Elodie.gif': {
            name: 'RIVETTE Elodie',
            title: 'DEAL CLEANER',
            description: 'Commerciale au sein du groupe Candor, DEAL CLEANER excelle à clarifier et concrétiser les opportunités commerciales. Grâce à son sens aigu de la négociation et sa persévérance, elle dépoussière les deals flous et transforme les prospects hésitants en partenaires solides. Son approche rigoureuse et son énergie communicative font d\'elle une alliée précieuse pour le développement et la croissance de l\'entreprise.',
            experience: 'Commerciale',
            specialty: 'Dépoussière les deals commerciaux flous'
        },
        'Gaelle.gif': {
            name: 'FAUTRAS Gaelle',
            title: 'EMPATHIQUE WOMAN',
            description: 'Assistante des ressources humaines au sein du groupe Candor, elle est reconnue pour son écoute attentive et sa capacité à comprendre les besoins de chacun. Toujours disponible, elle intervient avec empathie pour résoudre les problèmes et accompagner les collaborateurs dans leur parcours professionnel, créant un environnement de travail serein et humain.',
            experience: 'Assistante des ressources humaines',
            specialty: 'Toujours à l\'écoute pour résoudre les problèmes'
        },
        'Laury.gif': {
            name: 'FEUGRAY Laury',
            title: 'Captain Bienveillance',
            description: 'Gardienne du bien-être et de l\'épanouissement, Captain Bienveillance veille sur chaque collaborateur avec attention et empathie. Responsable du développement RH du groupe Candor, elle accompagne aussi bien les équipes que les managers dans leurs parcours, avec une présence rassurante et un engagement sans faille au service de l\'humain.',
            experience: 'Responsable développement RH',
            specialty: 'Toujours présente pour accompagner tous les collaborateurs'
        },
        'Annabelle.gif': {
            name: 'SERANDOUR Annabelle',
            title: 'Facturophile Masquée',
            description: 'Comptable clients au sein du groupe Candor, FACTUROPHILE MASQUÉE incarne la rigueur financière. Avec une attention minutieuse, elle s\'assure que chaque facture soit parfaitement justifiée, surtout celles sans bon de commande, pour éviter toute erreur ou dérive. Sa vigilance et son sens du détail protègent l\'entreprise contre les incohérences et contribuent à maintenir une gestion saine et transparente des comptes clients.',
            experience: 'Comptable clients',
            specialty: 'Rien ne lui échappe, surtout pas une facture sans bon de commande'
        },
        'BOSS.gif': {
            name: 'DAULL Jean Philippe',
            title: 'BIG BOSS',
            description: 'PDG visionnaire du groupe Candor, Mister Candor règne en leader incontesté sur la planète de la propreté. Charismatique et déterminé, il inspire et fédère les forces du secteur avec une autorité naturelle. Son pouvoir : guider ses équipes vers l\'excellence, unir les talents et faire briller les valeurs de Candor partout où l\'hygiène est en jeu.',
            experience: 'PDG du groupe CANDOR',
            specialty: 'Possède tous les pouvoirs de la planète CANDOR'
        },
        'Emmanuelle.gif': {
            name: 'PLANET Emanuelle',
            title: 'Lady Candor',
            description: 'Bras droit stratégique de BIG BOSS, Lady Candor orchestre avec brio les opérations et la RSE sur toute la planète Candor. Directrice déléguée et gardienne de l\'équilibre, elle coordonne les missions super héroïques avec rigueur et humanité. Son pouvoir : faire converger les forces vers un objectif commun, pour un monde plus propre, plus juste et plus responsable.',
            experience: 'Directrice opérations et RSE',
            specialty: 'Coordonne les activités super héroïque de la planète CANDOR'
        },
        'Sophie.gif': {
            name: 'BROUARD Sophie',
            title: 'Lady Lettrage',
            description: 'Comptable générale au sein du groupe Candor, LADY LETTRAGE règne sur les écritures comptables avec une précision implacable. Dotée d\'un sens aigu de l\'équilibre financier, chaque ligne doit, avec elle, trouver son correspondant — ou faire face à son implacable jugement fiscal. Derrière ses lunettes affûtées, elle détecte la moindre incohérence, même dissimulée dans les comptes les plus nébuleux. Grâce à sa vigilance et sa maîtrise des chiffres, elle garantit la fiabilité et la transparence des états financiers de l\'entreprise.',
            experience: 'Comptable générale',
            specialty: 'Chaque ligne d\'écriture trouve son pair — ou subit le jugement fiscal. Ses lunettes voient à travers les comptes flous'
        }
    };
    
    cards.forEach(card => {
        let isHovering = false;
        let mouseX = 0;
        let mouseY = 0;
        
        // Effet de brillance holographique
        const createHolographicEffect = () => {
            const shine = document.createElement('div');
            shine.className = 'holographic-shine';
            shine.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    45deg,
                    transparent 0%,
                    rgba(255, 255, 255, 0.1) 25%,
                    rgba(255, 255, 255, 0.3) 50%,
                    rgba(255, 255, 255, 0.1) 75%,
                    transparent 100%
                );
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
                z-index: 10;
                border-radius: 41px;
            `;
            card.appendChild(shine);
            return shine;
        };
        
        const shine = createHolographicEffect();
        
        // Gestionnaire d'entrée de souris
        card.addEventListener('mouseenter', (e) => {
            isHovering = true;
            shine.style.opacity = '1';
            updateCardTransform(e);
            
            // Effet de focus : changer le background et réduire l'opacité des autres
            card.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            card.style.borderColor = '#4f46e5';
            
            // Réduire l'opacité des autres cartes
            cards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.style.opacity = '0.3';
                    otherCard.style.filter = 'blur(1px)';
                    otherCard.style.transform = 'scale(0.95)';
                }
            });
        });
        
        // Gestionnaire de sortie de souris
        card.addEventListener('mouseleave', () => {
            isHovering = false;
            shine.style.opacity = '0';
            resetCardTransform();
            
            // Restaurer le background et l'opacité
            card.style.background = 'white';
            card.style.borderColor = '#e2e8f0';
            
            // Restaurer l'opacité de toutes les cartes
            cards.forEach(otherCard => {
                otherCard.style.opacity = '1';
                otherCard.style.filter = 'blur(0px)';
                otherCard.style.transform = 'scale(1)';
            });
        });
        
        // Gestionnaire de mouvement de souris
        card.addEventListener('mousemove', (e) => {
            if (isHovering) {
                updateCardTransform(e);
                updateHolographicEffect(e);
            }
        });
        
        // Gestionnaire de clic pour ouvrir le modal
        card.addEventListener('click', () => {
            openModal(card);
        });
        
        // Fonction de mise à jour de la transformation
        function updateCardTransform(e) {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            mouseX = e.clientX - centerX;
            mouseY = e.clientY - centerY;
            
            // Calcul des rotations basées sur la position de la souris
            const rotateX = (mouseY / (rect.height / 2)) * -15;
            const rotateY = (mouseX / (rect.width / 2)) * 15;
            
            // Effet de profondeur basé sur la distance du centre
            const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
            const maxDistance = Math.sqrt((rect.width / 2) * (rect.width / 2) + (rect.height / 2) * (rect.height / 2));
            const depth = (distance / maxDistance) * 20;
            
            // Application de la transformation
            card.style.transform = `
                translateY(-10px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                translateZ(${depth}px)
                scale(1.05)
            `;
            
            // Mise à jour des ombres holographiques
            updateHolographicShadows(rotateX, rotateY, depth);
        }
        
        // Fonction de réinitialisation
        function resetCardTransform() {
            card.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
        }
        
        // Fonction de mise à jour des ombres holographiques
        function updateHolographicShadows(rotateX, rotateY, depth) {
            const intensity = Math.abs(rotateX) + Math.abs(rotateY);
            const blueIntensity = Math.max(0.05, intensity / 60);
            const purpleIntensity = Math.max(0.03, intensity / 80);
            
            card.style.boxShadow = `
                0 20px 40px rgba(0, 0, 0, 0.15),
                0 0 ${20 + depth}px rgba(59, 130, 246, ${blueIntensity}),
                0 0 ${40 + depth * 1.5}px rgba(139, 92, 246, ${purpleIntensity}),
                inset 0 0 15px rgba(255, 255, 255, 0.05)
            `;
        }
        
        // Fonction de mise à jour de l'effet holographique
        function updateHolographicEffect(e) {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            // Création d'un effet de brillance qui suit la souris
            shine.style.background = `
                radial-gradient(
                    circle at ${x}% ${y}%,
                    rgba(255, 255, 255, 0.4) 0%,
                    rgba(255, 255, 255, 0.2) 20%,
                    rgba(59, 130, 246, 0.1) 40%,
                    rgba(139, 92, 246, 0.05) 60%,
                    transparent 80%
                ),
                linear-gradient(
                    45deg,
                    transparent 0%,
                    rgba(255, 255, 255, 0.1) 25%,
                    rgba(255, 255, 255, 0.3) 50%,
                    rgba(255, 255, 255, 0.1) 75%,
                    transparent 100%
                )
            `;
        }
    });
    
    // Fonction d'ouverture du modal
    function openModal(card) {
        const gifSrc = card.querySelector('.member-gif').src;
        const gifName = gifSrc.split('/').pop();
        const memberData = teamMembers[gifName];
        
        if (memberData) {
            // Réinitialiser la transformation de la carte originale
            card.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
            card.style.background = 'white';
            card.style.borderColor = '#e2e8f0';
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            
            // Réinitialiser l'opacité de toutes les cartes
            cards.forEach(otherCard => {
                otherCard.style.opacity = '1';
                otherCard.style.filter = 'blur(0px)';
                otherCard.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
            });
            
            // Cloner la carte pour le modal (après réinitialisation)
            const clonedCard = card.cloneNode(true);
            modalCard.innerHTML = '';
            modalCard.appendChild(clonedCard);
            
            // Appliquer l'effet holographique sur la carte du modal
            applyHolographicEffectToModalCard(clonedCard);
            
            // Mettre à jour les informations du modal
            document.getElementById('modalName').textContent = memberData.name;
            document.getElementById('modalTitle').textContent = memberData.title;
            document.getElementById('modalDescription').innerHTML = `<p>${memberData.description}</p>`;
            document.getElementById('modalExperience').textContent = memberData.experience;
            document.getElementById('modalSpecialty').textContent = memberData.specialty;
            
            // Ouvrir le modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Fonction pour appliquer l'effet holographique sur la carte du modal
    function applyHolographicEffectToModalCard(modalCard) {
        let isHovering = false;
        let mouseX = 0;
        let mouseY = 0;
        
        // Effet de brillance holographique
        const createModalHolographicEffect = () => {
            const shine = document.createElement('div');
            shine.className = 'modal-holographic-shine';
            shine.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    45deg,
                    transparent 0%,
                    rgba(255, 255, 255, 0.1) 25%,
                    rgba(255, 255, 255, 0.3) 50%,
                    rgba(255, 255, 255, 0.1) 75%,
                    transparent 100%
                );
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
                z-index: 10;
                border-radius: 41px;
            `;
            modalCard.appendChild(shine);
            return shine;
        };
        
        const shine = createModalHolographicEffect();
        
        // Gestionnaire d'entrée de souris
        modalCard.addEventListener('mouseenter', (e) => {
            isHovering = true;
            shine.style.opacity = '1';
            updateModalCardTransform(e);
        });
        
        // Gestionnaire de sortie de souris
        modalCard.addEventListener('mouseleave', () => {
            isHovering = false;
            shine.style.opacity = '0';
            resetModalCardTransform();
        });
        
        // Gestionnaire de mouvement de souris
        modalCard.addEventListener('mousemove', (e) => {
            if (isHovering) {
                updateModalCardTransform(e);
                updateModalHolographicEffect(e);
            }
        });
        
        // Fonction de mise à jour de la transformation pour le modal
        function updateModalCardTransform(e) {
            const rect = modalCard.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            mouseX = e.clientX - centerX;
            mouseY = e.clientY - centerY;
            
            // Calcul des rotations basées sur la position de la souris
            const rotateX = (mouseY / (rect.height / 2)) * -15;
            const rotateY = (mouseX / (rect.width / 2)) * 15;
            
            // Effet de profondeur basé sur la distance du centre
            const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
            const maxDistance = Math.sqrt((rect.width / 2) * (rect.width / 2) + (rect.height / 2) * (rect.height / 2));
            const depth = (distance / maxDistance) * 20;
            
            // Application de la transformation
            modalCard.style.transform = `
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                translateZ(${depth}px)
            `;
            
            // Mise à jour des ombres holographiques
            updateModalHolographicShadows(rotateX, rotateY, depth);
        }
        
        // Fonction de réinitialisation pour le modal
        function resetModalCardTransform() {
            modalCard.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
            modalCard.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
        }
        
        // Fonction de mise à jour des ombres holographiques pour le modal
        function updateModalHolographicShadows(rotateX, rotateY, depth) {
            const intensity = Math.abs(rotateX) + Math.abs(rotateY);
            const blueIntensity = Math.max(0.05, intensity / 60);
            const purpleIntensity = Math.max(0.03, intensity / 80);
            
            modalCard.style.boxShadow = `
                0 20px 60px rgba(0, 0, 0, 0.3),
                0 0 ${20 + depth}px rgba(59, 130, 246, ${blueIntensity}),
                0 0 ${40 + depth * 1.5}px rgba(139, 92, 246, ${purpleIntensity}),
                inset 0 0 15px rgba(255, 255, 255, 0.05)
            `;
        }
        
        // Fonction de mise à jour de l'effet holographique pour le modal
        function updateModalHolographicEffect(e) {
            const rect = modalCard.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            // Calculer les rotations pour l'effet de lumière
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;
            const rotateX = (mouseY / (rect.height / 2)) * -15;
            const rotateY = (mouseX / (rect.width / 2)) * 15;
            
            // Création d'un effet de brillance qui suit la souris
            shine.style.background = `
                radial-gradient(
                    circle at ${x}% ${y}%,
                    rgba(255, 255, 255, 0.4) 0%,
                    rgba(255, 255, 255, 0.2) 20%,
                    rgba(59, 130, 246, 0.1) 40%,
                    rgba(139, 92, 246, 0.05) 60%,
                    transparent 80%
                ),
                linear-gradient(
                    45deg,
                    transparent 0%,
                    rgba(255, 255, 255, 0.1) 25%,
                    rgba(255, 255, 255, 0.3) 50%,
                    rgba(255, 255, 255, 0.1) 75%,
                    transparent 100%
                )
            `;
            
            // Effet de lumière dynamique derrière la carte
            const lightIntensity = Math.abs(rotateX) + Math.abs(rotateY);
            const lightGlow = Math.max(0.2, lightIntensity / 30);
            
            // Appliquer les variables au wrapper au lieu de la carte
            const wrapper = modalCard.closest('.modal-card-wrapper');
            if (wrapper) {
                wrapper.style.setProperty('--light-opacity', lightGlow);
                wrapper.style.setProperty('--light-x', `${x}%`);
                wrapper.style.setProperty('--light-y', `${y}%`);
            }
        }
    }
    
    // Gestionnaire de fermeture du modal
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Fermeture avec la touche Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});
