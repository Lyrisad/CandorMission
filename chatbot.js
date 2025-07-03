// Chatbot FAQ JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const chatbotContainer = document.getElementById('chatbotContainer');
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotBadge = document.getElementById('chatbotBadge');
    
    // State
    let isOpen = false;
    let faqData = [];
    let categoriesData = [];
    let isTyping = false;
    
    // Common words to ignore in matching (French stop words)
    const stopWords = [
        'le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour',
        'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus',
        'par', 'grand', 'lui', 'ou', 'si', 'les', 'des', 'la', 'du', 'au', 'aux',
        'est', 'sont', 'était', 'étaient', 'sera', 'seront', 'a', 'ai', 'as', 'avons',
        'ont', 'aura', 'auront', 'je', 'tu', 'nous', 'vous', 'ils', 'elles', 'très',
        'bien', 'faire', 'aller', 'voir', 'savoir', 'dire', 'vouloir', 'pouvoir'
    ];
    
    // Synonyms dictionary for better matching
    const synonyms = {
        // Question words
        'quoi': ['quel', 'quelle', 'quels', 'quelles', 'que', 'quest-ce'],
        'quel': ['quoi', 'quelle', 'quels', 'quelles'],
        'quelle': ['quoi', 'quel', 'quels', 'quelles'],
        'quels': ['quoi', 'quel', 'quelle', 'quelles'],
        'quelles': ['quoi', 'quel', 'quelle', 'quels'],
        
        // Payment related
        'paiement': ['paiements', 'payement', 'payements', 'règlement', 'règlements'],
        'paiements': ['paiement', 'payement', 'payements', 'règlement', 'règlements'],
        'moyen': ['moyens', 'méthode', 'méthodes', 'façon', 'façons', 'manière', 'manières'],
        'moyens': ['moyen', 'méthode', 'méthodes', 'façon', 'façons', 'manière', 'manières'],
        
        // Action verbs - significantly expanded
        'avez': ['acceptez', 'proposez', 'offrez', 'utilisez', 'faites', 'donnez', 'fournissez'],
        'acceptez': ['avez', 'proposez', 'offrez', 'utilisez', 'prenez'],
        'proposez': ['avez', 'acceptez', 'offrez', 'utilisez', 'donnez', 'fournissez'],
        'offrez': ['avez', 'acceptez', 'proposez', 'utilisez', 'donnez', 'fournissez'],
        'faites': ['avez', 'proposez', 'offrez', 'réalisez', 'effectuez'],
        'donnez': ['avez', 'proposez', 'offrez', 'fournissez'],
        'fournissez': ['avez', 'proposez', 'offrez', 'donnez'],
        
        // Warranty and guarantee terms
        'garantie': ['garanties', 'assurance', 'assurances', 'couverture', 'protection'],
        'garanties': ['garantie', 'assurance', 'assurances', 'couverture', 'protection'],
        'assurance': ['garantie', 'garanties', 'couverture', 'protection'],
        'assurances': ['garantie', 'garanties', 'couverture', 'protection'],
        
        // Repair terms
        'réparation': ['réparations', 'dépannage', 'maintenance', 'intervention'],
        'réparations': ['réparation', 'dépannage', 'maintenance', 'interventions'],
        'dépannage': ['réparation', 'réparations', 'maintenance', 'intervention'],
        'maintenance': ['réparation', 'réparations', 'entretien', 'dépannage'],
        
        // Common business terms
        'service': ['services', 'prestation', 'prestations'],
        'services': ['service', 'prestation', 'prestations'],
        'prix': ['tarif', 'tarifs', 'coût', 'coûts', 'montant', 'montants'],
        'tarif': ['prix', 'tarifs', 'coût', 'coûts', 'montant', 'montants'],
        
        // Time related
        'délai': ['délais', 'durée', 'temps', 'période'],
        'délais': ['délai', 'durée', 'temps', 'période'],
        'durée': ['délai', 'délais', 'temps', 'période'],
        
        // Location
        'où': ['comment', 'quand', 'lieu', 'endroit', 'adresse'],
        'comment': ['où', 'quand', 'manière', 'façon'],
        'lieu': ['où', 'endroit', 'adresse', 'emplacement'],
        'endroit': ['où', 'lieu', 'adresse', 'emplacement'],
        
        // Contact
        'contact': ['contacter', 'joindre', 'appeler', 'écrire'],
        'contacter': ['contact', 'joindre', 'appeler', 'écrire'],
        'joindre': ['contact', 'contacter', 'appeler', 'écrire']
    };
    
    // Word normalizations (singular forms)
    const normalizations = {
        'paiements': 'paiement',
        'payements': 'paiement',
        'moyens': 'moyen',
        'méthodes': 'méthode',
        'services': 'service',
        'prestations': 'prestation',
        'tarifs': 'tarif',
        'coûts': 'coût',
        'montants': 'montant',
        'façons': 'façon',
        'manières': 'manière',
        'garanties': 'garantie',
        'assurances': 'assurance',
        'réparations': 'réparation',
        'interventions': 'intervention',
        'délais': 'délai',
        'durées': 'durée',
        'périodes': 'période',
        'lieux': 'lieu',
        'endroits': 'endroit',
        'emplacements': 'emplacement'
    };
    
    // Initialize chatbot
    init();
    
    function init() {
        // Load FAQ data
        loadFAQData();
        
        // Event listeners
        chatbotToggle.addEventListener('click', toggleChatbot);
        chatbotClose.addEventListener('click', closeChatbot);
        chatbotSend.addEventListener('click', sendMessage);
        
        chatbotInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Auto-focus input when chatbot opens
        chatbotWindow.addEventListener('transitionend', function() {
            if (isOpen) {
                chatbotInput.focus();
            }
        });
        
        // Hide badge initially
        chatbotBadge.style.display = 'flex';
    }
    
    // Load FAQ data from the main FAQ page
    function loadFAQData() {
        // Try to get data from the main FAQ script if available
        if (typeof faqs !== 'undefined' && typeof categories !== 'undefined') {
            faqData = faqs;
            categoriesData = categories;
        } else {
            // Load from Google Sheets directly
            loadFAQFromSheets();
        }
    }
    
    // Load FAQ data from Google Sheets
    function loadFAQFromSheets() {
        Promise.all([
            loadCategoriesFromSheets(),
            loadFAQsFromSheets()
        ]).then(() => {
            console.log('FAQ data loaded for chatbot:', faqData.length, 'questions');
        }).catch(error => {
            console.error('Error loading FAQ data for chatbot:', error);
        });
    }
    
    function loadCategoriesFromSheets() {
        const url = `${GOOGLE_SCRIPT_URL}?action=readCategories`;
        
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.values) {
                    categoriesData = data.values.filter(category => category.visible === true);
                } else {
                    categoriesData = [];
                }
            })
            .catch(error => {
                console.error('Error loading categories for chatbot:', error);
                categoriesData = [];
            });
    }
    
    function loadFAQsFromSheets() {
        const url = `${GOOGLE_SCRIPT_URL}?action=readFAQs`;
        
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.values) {
                    faqData = data.values.filter(faq => faq.visible === true);
                } else {
                    faqData = [];
                }
            })
            .catch(error => {
                console.error('Error loading FAQs for chatbot:', error);
                faqData = [];
            });
    }
    
    // Toggle chatbot window
    function toggleChatbot() {
        if (isOpen) {
            closeChatbot();
        } else {
            openChatbot();
        }
    }
    
    // Open chatbot
    function openChatbot() {
        isOpen = true;
        chatbotWindow.classList.add('active');
        chatbotBadge.style.display = 'none';
        chatbotInput.focus();
    }
    
    // Close chatbot
    function closeChatbot() {
        isOpen = false;
        chatbotWindow.classList.remove('active');
    }
    
    // Send message
    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (!message || isTyping) return;
        
        // Add user message
        addMessage(message, 'user');
        
        // Clear input
        chatbotInput.value = '';
        
        // Process message
        processUserMessage(message);
    }
    
    // Add message to chat
    function addMessage(text, sender, isHTML = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        if (isHTML) {
            content.innerHTML = text;
        } else {
            content.innerHTML = `<p>${escapeHtml(text)}</p>`;
        }
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        chatbotMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        chatbotMessages.appendChild(typingDiv);
        scrollToBottom();
        isTyping = true;
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        isTyping = false;
    }
    
    // Process user message
    function processUserMessage(message) {
        // Handle special commands first
        if (handleSpecialCommands(message)) {
            return;
        }
        
        showTypingIndicator();
        
        // Simulate thinking time
        setTimeout(() => {
            hideTypingIndicator();
            
            // Find matching FAQ
            const matches = findFAQMatches(message);
            
            if (matches.length > 0) {
                // Return best match
                const bestMatch = matches[0];
                respondWithFAQ(bestMatch);
            } else {
                // No match found, suggest contact
                suggestContact(message);
            }
        }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
    }
    
    // Find FAQ matches using keyword analysis
    function findFAQMatches(userMessage) {
        const userWords = extractKeywords(userMessage.toLowerCase());
        const matches = [];
        
        // Debug: Log user keywords
        console.log('🔍 User keywords:', userWords);
        
        faqData.forEach(faq => {
            const questionWords = extractKeywords(faq.question.toLowerCase());
            const answerWords = extractKeywords(faq.reponse.toLowerCase());
            const allFAQWords = [...questionWords, ...answerWords];
            
            // Calculate similarity score
            const score = calculateSimilarity(userWords, allFAQWords);
            
            // Debug: Log scores for important business terms
            const debugTerms = ['paiement', 'moyen', 'garantie', 'réparation', 'service', 'prix', 'tarif', 'contact'];
            const shouldDebug = debugTerms.some(term => 
                userWords.includes(term) || questionWords.includes(term) || answerWords.includes(term)
            );
            
            if (shouldDebug) {
                const emoji = userWords.includes('paiement') ? '💰' : 
                             userWords.includes('garantie') ? '🛡️' : 
                             userWords.includes('réparation') ? '🔧' : '💼';
                console.log(`${emoji} "${faq.question}" - Score: ${score.toFixed(3)}`);
                console.log(`   FAQ keywords: ${questionWords.join(', ')}`);
                console.log(`   User keywords: ${userWords.join(', ')}`);
            }
            
            // More flexible matching criteria
            const directMatches = userWords.filter(word => questionWords.includes(word) || answerWords.includes(word));
            const hasKeywordMatch = directMatches.length >= 2; // At least 2 direct keyword matches
            const meetsScoreThreshold = score > 0.12; // Lowered threshold
            
            if (meetsScoreThreshold || hasKeywordMatch) {
                matches.push({
                    faq: faq,
                    score: score,
                    category: categoriesData.find(cat => cat.id === faq.categorie),
                    directMatches: directMatches.length
                });
            }
        });
        
        console.log('✨ Found matches:', matches.map(m => ({
            question: m.faq.question,
            score: m.score.toFixed(3),
            directMatches: m.directMatches
        })));
        
        // Sort by direct matches first, then by score (prioritize exact keyword matches)
        return matches
            .sort((a, b) => {
                if (a.directMatches !== b.directMatches) {
                    return b.directMatches - a.directMatches; // More direct matches first
                }
                return b.score - a.score; // Then by score
            })
            .slice(0, 3);
    }
    
    // Extract keywords from text
    function extractKeywords(text) {
        return text
            .replace(/[^\w\sàâäéèêëïîôöùûüÿç]/g, '') // Remove special chars except accents
            .split(/\s+/)
            .filter(word => word.length > 2) // Remove short words
            .filter(word => !stopWords.includes(word.toLowerCase())) // Remove stop words
            .map(word => {
                const lowerWord = word.toLowerCase();
                // Normalize word (convert plural to singular, etc.)
                return normalizations[lowerWord] || lowerWord;
            });
    }
    
    // Calculate similarity between two word arrays
    function calculateSimilarity(userWords, faqWords) {
        if (userWords.length === 0 || faqWords.length === 0) return 0;
        
        let totalMatches = 0;
        
        // Check for direct matches and synonym matches
        userWords.forEach(userWord => {
            // Direct match
            if (faqWords.includes(userWord)) {
                totalMatches += 1;
                return;
            }
            
            // Synonym match
            const userSynonyms = synonyms[userWord] || [];
            const synonymMatch = userSynonyms.some(synonym => faqWords.includes(synonym));
            if (synonymMatch) {
                totalMatches += 0.8; // Synonym matches are worth slightly less than exact matches
                return;
            }
            
            // Partial word match (for variations like "paiement"/"paiements")
            const partialMatch = faqWords.some(faqWord => {
                return (userWord.length > 4 && faqWord.includes(userWord)) ||
                       (faqWord.length > 4 && userWord.includes(faqWord));
            });
            if (partialMatch) {
                totalMatches += 0.6;
            }
        });
        
        // Base similarity score
        const similarity = totalMatches / Math.max(userWords.length, faqWords.length);
        
        // Bonus for exact phrase matches
        const userText = userWords.join(' ');
        const faqText = faqWords.join(' ');
        
        let phraseBonus = 0;
        for (let i = 0; i < userWords.length - 1; i++) {
            const phrase = userWords.slice(i, i + 2).join(' ');
            if (faqText.includes(phrase)) {
                phraseBonus += 0.15;
            }
        }
        
        // Extra bonus for key business terms
        const keyTerms = ['paiement', 'service', 'prix', 'tarif', 'contact', 'garantie', 'réparation', 'délai', 'moyen'];
        const keyTermBonus = userWords.filter(word => keyTerms.includes(word)).length * 0.1;
        
        return Math.min(1.0, similarity + phraseBonus + keyTermBonus);
    }
    
    // Respond with FAQ answer
    function respondWithFAQ(match) {
        const { faq, score, category } = match;
        const categoryName = category ? category.nom : 'Général';
        const categoryEmoji = category ? category.emoji || '📋' : '📋';
        
        const confidence = score > 0.5 ? 'très pertinente' : score > 0.3 ? 'pertinente' : 'potentiellement utile';
        
        const responseHTML = `
            <p>Je pense avoir trouvé une réponse ${confidence} à votre question !</p>
            <div class="faq-reference">
                <strong>${categoryEmoji} ${escapeHtml(faq.question)}</strong><br><br>
                ${escapeHtml(faq.reponse).replace(/\n/g, '<br>')}<br><br>
                <small><em>Catégorie: ${escapeHtml(categoryName)}</em></small>
            </div>
            <p>Cette réponse vous aide-t-elle ? Si vous avez besoin de plus d'informations, n'hésitez pas à <a href="contact.html" style="color: #3b82f6; text-decoration: none; font-weight: 600;">nous contacter</a> !</p>
        `;
        
        addMessage(responseHTML, 'bot', true);
    }
    
    // Suggest contact when no match is found
    function suggestContact(userMessage) {
        const responses = [
            `Je n'ai pas trouvé de réponse spécifique à votre question dans notre FAQ actuelle.`,
            `Hmm, votre question ne correspond pas exactement à nos FAQ existantes.`,
            `Cette question ne figure pas dans notre base de connaissances pour le moment.`
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const responseHTML = `
            <p>${randomResponse}</p>
            <div class="contact-suggestion">
                <strong>💬 Besoin d'aide personnalisée ?</strong><br>
                Notre équipe sera ravie de vous aider !<br><br>
                <a href="contact.html">👉 Contactez-nous directement</a>
            </div>
            <p>Vous pouvez aussi explorer notre FAQ complète ci-dessus pour voir si d'autres questions peuvent vous intéresser !</p>
        `;
        
        addMessage(responseHTML, 'bot', true);
    }
    
    // Handle special commands
    function handleSpecialCommands(message) {
        const command = message.toLowerCase().trim();
        
        if (command === '/help' || command === 'aide') {
            const helpHTML = `
                <p>🤖 <strong>Assistant FAQ - Guide d'utilisation</strong></p>
                <div class="faq-reference">
                    <strong>Comment m'utiliser :</strong><br>
                    • Posez-moi une question en français<br>
                    • Je chercherai dans notre FAQ<br>
                    • Si je trouve une réponse, je vous la donnerai<br>
                    • Sinon, je vous dirigerai vers notre équipe<br><br>
                    <strong>Exemples de questions :</strong><br>
                    • "Comment faire pour..."<br>
                    • "Où puis-je trouver..."<br>
                    • "Quels sont vos services ?"
                </div>
            `;
            addMessage(helpHTML, 'bot', true);
            return true;
        }
        
        if (command === '/reset' || command === 'reset') {
            // Clear chat except welcome message
            const messages = chatbotMessages.querySelectorAll('.message');
            messages.forEach((msg, index) => {
                if (index > 0) { // Keep first welcome message
                    msg.remove();
                }
            });
            addMessage("💫 Chat réinitialisé ! Comment puis-je vous aider ?", 'bot');
            return true;
        }
        
        return false;
    }
    
    // Scroll to bottom of messages
    function scrollToBottom() {
        setTimeout(() => {
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }, 100);
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}); 