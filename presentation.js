// Effet holographique interactif pour les cartes
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.pokemon-card');
    
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
        });
        
        // Gestionnaire de sortie de souris
        card.addEventListener('mouseleave', () => {
            isHovering = false;
            shine.style.opacity = '0';
            resetCardTransform();
        });
        
        // Gestionnaire de mouvement de souris
        card.addEventListener('mousemove', (e) => {
            if (isHovering) {
                updateCardTransform(e);
                updateHolographicEffect(e);
            }
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
            `;
            
            // Mise à jour des ombres holographiques
            updateHolographicShadows(rotateX, rotateY, depth);
        }
        
        // Fonction de réinitialisation
        function resetCardTransform() {
            card.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg) translateZ(0px)';
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
        }
        
        // Fonction de mise à jour des ombres holographiques
        function updateHolographicShadows(rotateX, rotateY, depth) {
            const intensity = Math.abs(rotateX) + Math.abs(rotateY);
            const blueIntensity = Math.max(0.1, intensity / 30);
            const purpleIntensity = Math.max(0.05, intensity / 40);
            
            card.style.boxShadow = `
                0 20px 40px rgba(0, 0, 0, 0.15),
                0 0 ${30 + depth}px rgba(59, 130, 246, ${blueIntensity}),
                0 0 ${60 + depth * 2}px rgba(139, 92, 246, ${purpleIntensity}),
                inset 0 0 20px rgba(255, 255, 255, 0.1),
                ${rotateX > 0 ? '-' : ''}${Math.abs(rotateX) * 2}px 0 ${Math.abs(rotateX) * 3}px rgba(59, 130, 246, 0.3),
                ${rotateY > 0 ? '-' : ''}${Math.abs(rotateY) * 2}px 0 ${Math.abs(rotateY) * 3}px rgba(139, 92, 246, 0.3)
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
});
