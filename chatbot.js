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
    let profanityWarnings = 0; // Track profanity warnings
    
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
    
    // Profanity filter - inappropriate words (French)
    const profanityWords = [
        // Common profanity
        'merde', 'putain', 'bordel', 'salaud', 'salope', 'connard', 'connasse', 'enculé', 'encule',
        'pute', 'fils de pute', 'fdp', 'batard', 'bâtard', 'chier', 'niquer', 'nique', 'tête de con',
        'imbécile', 'crétin', 'abruti', 'débile', 'taré', 'attardé', 'mongol', 'trisomique',
        
        // Variations and leetspeak
        'm3rd3', 'put41n', 'p0rn', 'sx3', 'f0utr3', 'b0rd3l', 'c0nn4rd', 'n1qu3r',
        
        // Racist/discriminatory terms
        'négro', 'nègre', 'bamboula', 'bicot', 'bougnoule', 'youpin', 'pédale', 'tapette',
        
        // Drugs
        'drogue', 'weed', 'cannabis', 'cocaine', 'héroïne', 'ecstasy', 'lsd', 'shit',
        
        // Violence threats
        'tuer', 'mort', 'crever', 'buter', 'flingue', 'arme', 'violence', 'frapper',
        'tabasser', 'cogner', 'exploser', 'niquer ta mère', 'ta gueule', 'ferme ta gueule'
    ];
    
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
    
    // Check for profanity in message
    function containsProfanity(message) {
        const lowerMessage = message.toLowerCase();
        
        // Remove special characters and split into words
        const words = lowerMessage
            .replace(/[^\w\sàâäéèêëïîôöùûüÿç]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0);
        
        // Check for direct matches
        const directMatches = words.filter(word => profanityWords.includes(word));
        if (directMatches.length > 0) {
            return { hasProfanity: true, words: directMatches };
        }
        
        // Check for profanity within longer words or phrases
        const containsMatch = profanityWords.some(profanity => lowerMessage.includes(profanity));
        if (containsMatch) {
            const matchedWords = profanityWords.filter(profanity => lowerMessage.includes(profanity));
            return { hasProfanity: true, words: matchedWords };
        }
        
        return { hasProfanity: false, words: [] };
    }
    
    // Handle profanity warning
    function handleProfanityWarning(detectedWords) {
        profanityWarnings++;
        
        let warningMessage = '';
        let isBlocked = false;
        
        if (profanityWarnings === 1) {
            // First warning - gentle
            const firstWarnings = [
                "🚫 Veuillez utiliser un langage approprié. Je suis là pour vous aider de manière professionnelle.",
                "⚠️ Merci de rester poli dans vos messages. Comment puis-je vous aider aujourd'hui ?",
                "🤝 Gardons une conversation respectueuse. Que souhaitez-vous savoir ?"
            ];
            warningMessage = firstWarnings[Math.floor(Math.random() * firstWarnings.length)];
        } else if (profanityWarnings === 2) {
            // Second warning - more firm
            const secondWarnings = [
                "🚨 <strong>Deuxième avertissement</strong> - Merci de surveiller votre langage.",
                "⚠️ <strong>Attention</strong> - Utilisez un vocabulaire approprié pour continuer.",
                "🛑 <strong>Rappel</strong> - Gardez un ton professionnel dans vos messages."
            ];
            warningMessage = secondWarnings[Math.floor(Math.random() * secondWarnings.length)];
        } else if (profanityWarnings === 3) {
            // Third warning - final warning
            warningMessage = "🚫 <strong>Dernier avertissement</strong> - Un langage inapproprié supplémentaire entraînera une suspension temporaire.";
        } else {
            // Block after 3 warnings
            isBlocked = true;
            warningMessage = "🚫 <strong>Conversation suspendue</strong> - Vous avez dépassé le nombre d'avertissements autorisés. Veuillez actualiser la page pour recommencer.";
        }
        
        // Add warning message
        setTimeout(() => {
            hideTypingIndicator();
            addMessage(warningMessage, 'bot', true);
            
            if (isBlocked) {
                // Disable input after final warning
                chatbotInput.disabled = true;
                chatbotSend.disabled = true;
                chatbotInput.placeholder = "Chat suspendu - Actualisez la page";
                
                // Add final message
                setTimeout(() => {
                    const finalMessage = `
                        <p>🔒 <strong>Pour continuer :</strong></p>
                        <ul>
                            <li>Actualisez la page (F5)</li>
                            <li>Utilisez un langage respectueux</li>
                            <li>Consultez nos FAQ pour des réponses rapides</li>
                        </ul>
                    `;
                    addMessage(finalMessage, 'bot', true);
                }, 1000);
            } else {
                // Add helpful suggestion for non-blocked warnings
                setTimeout(() => {
                    const helpMessage = `
                        <p>💡 <strong>Suggestions :</strong></p>
                        <ul>
                            <li>Reformulez votre question poliment</li>
                            <li>Tapez <strong>/help</strong> pour voir les commandes</li>
                            <li>Consultez nos FAQ sur la page</li>
                        </ul>
                        <p><small>Avertissement ${profanityWarnings}/3</small></p>
                    `;
                    addMessage(helpMessage, 'bot', true);
                }, 500);
            }
        }, 800);
    }
    
    // Check for company/mission questions
    function handleCompanyQuestions(message) {
        const lowerMessage = message.toLowerCase();
        
        // Keywords for company/mission questions
        const companyKeywords = [
            'candor ma mission', 'candor mission', 'votre entreprise', 'votre société', 'votre mission',
            'qui êtes-vous', 'que faites-vous', 'c\'est quoi candor', 'présentation entreprise',
            'raison d\'être', 'objectifs', 'vision', 'valeurs', 'qui vous êtes'
        ];
        
        const isCompanyQuestion = companyKeywords.some(keyword => lowerMessage.includes(keyword));
        
        if (isCompanyQuestion) {
            const companyResponse = `
                <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 1.5rem; border-radius: 15px; margin: 0.5rem 0;">
                    <h3 style="margin: 0 0 1rem 0; text-align: center;">🏢 CANDOR MA MISSION</h3>
                </div>
                
                <div style="background: rgba(59, 130, 246, 0.1); padding: 1.5rem; border-radius: 15px; border-left: 4px solid #3b82f6; margin: 1rem 0;">
                    <h4 style="margin: 0 0 1rem 0; color: #1e40af;">🎯 NOTRE RAISON D'ÊTRE :</h4>
                    <p style="margin: 0.5rem 0; line-height: 1.6;"><strong>Convaincus</strong> que les métiers de la propreté sont essentiels au bien-être dans notre Société,</p>
                    <p style="margin: 0.5rem 0; line-height: 1.6;"><strong>Forts</strong> de notre indépendance et de notre ancrage local,</p>
                    <p style="margin: 0.5rem 0; line-height: 1.6;">Nous souhaitons développer une <strong>approche transparente et innovante</strong> de notre métier, le rendre visible et l'humaniser.</p>
                </div>
                
                <div style="background: rgba(139, 92, 246, 0.1); padding: 1.5rem; border-radius: 15px; border-left: 4px solid #8b5cf6; margin: 1rem 0;">
                    <h4 style="margin: 0 0 1rem 0; color: #7c3aed;">⚡ NOS OBJECTIFS :</h4>
                    <ol style="margin: 0; padding-left: 1.5rem; line-height: 1.7;">
                        <li style="margin: 0.5rem 0;"><strong>Faire de la qualité, de la proximité et de la transparence</strong> les fondements de toutes nos relations</li>
                        <li style="margin: 0.5rem 0;"><strong>Favoriser le bien-être, l'inclusion et l'accompagnement</strong> de nos collaborateurs</li>
                        <li style="margin: 0.5rem 0;"><strong>Sensibiliser et engager</strong> nos clients et partenaires autour de notre vision des métiers de la propreté</li>
                    </ol>
                </div>
                
                <p style="text-align: center; margin-top: 1rem; color: #64748b;">
                    <em>Une mission qui nous anime chaque jour ! ✨</em>
                </p>
            `;
            
            return companyResponse;
        }
        
        return null;
    }
    
    // Check for casual greetings and social questions
    function handleSocialQuestions(message) {
        const lowerMessage = message.toLowerCase().trim();
        
        // Social greetings and questions
        const socialPatterns = [
            // How are you patterns
            /comment (ça|ca) va/i,
            /comment allez.vous/i,
            /vous allez bien/i,
            /ça va/i,
            /ca va/i,
            /tout va bien/i,
            /comment vous portez.vous/i,
            
            // Simple greetings
            /^(salut|hello|coucou|hey|bonjour|bonsoir)$/i,
            /^(comment vas.tu|comment tu vas)$/i,
            
            // Status questions
            /comment vous sentez.vous/i,
            /êtes.vous en forme/i,
            /vous vous portez bien/i
        ];
        
        const isSocialQuestion = socialPatterns.some(pattern => pattern.test(lowerMessage));
        
        if (isSocialQuestion) {
            const socialResponses = [
                {
                    text: "🤖 Bonjour ! Je vais très bien, merci ! Je suis là pour vous aider avec toutes vos questions sur Candor Ma Mission et nos services de propreté.",
                    follow: "Comment puis-je vous être utile aujourd'hui ? 😊"
                },
                {
                    text: "👋 Salut ! Ça va parfaitement bien de mon côté ! Je suis votre assistant virtuel, toujours prêt à répondre à vos questions.",
                    follow: "Que souhaitez-vous savoir sur nos services ? 💡"
                },
                {
                    text: "😊 Hello ! Je me porte à merveille, merci de demander ! Je suis ici pour vous accompagner et répondre à toutes vos interrogations.",
                    follow: "N'hésitez pas à me poser vos questions ! 🚀"
                },
                {
                    text: "🌟 Bonjour ! Tout va super bien ! En tant qu'assistant IA de Candor Ma Mission, je suis toujours en forme pour vous aider.",
                    follow: "Qu'aimeriez-vous découvrir sur notre entreprise ou nos services ? 🏢"
                },
                {
                    text: "💫 Coucou ! Je vais très bien, merci beaucoup ! Je suis ravi de pouvoir discuter avec vous et de vous renseigner.",
                    follow: "Posez-moi toutes vos questions, je suis là pour ça ! ✨"
                }
            ];
            
            const randomResponse = socialResponses[Math.floor(Math.random() * socialResponses.length)];
            
            const socialHTML = `
                <p>${randomResponse.text}</p>
                <div style="background: rgba(34, 197, 94, 0.1); padding: 1rem; border-radius: 10px; border-left: 3px solid #22c55e; margin: 1rem 0;">
                    <p style="margin: 0; color: #16a34a;"><strong>${randomResponse.follow}</strong></p>
                </div>
            `;
            
            return socialHTML;
        }
        
        return null;
    }
    
    // Process user message
    function processUserMessage(message) {
        // Handle special commands first
        if (handleSpecialCommands(message)) {
            return;
        }
        
        // Check for profanity
        const profanityCheck = containsProfanity(message);
        if (profanityCheck.hasProfanity) {
            console.warn('🚫 Profanity detected:', profanityCheck.words);
            
            // If chat is already disabled, ignore the message completely
            if (chatbotInput.disabled) {
                return;
            }
            
            showTypingIndicator();
            handleProfanityWarning(profanityCheck.words);
            return;
        }
        
        showTypingIndicator();
        
        // Simulate thinking time
        setTimeout(() => {
            hideTypingIndicator();
            
            // Check for company/mission questions first
            const companyResponse = handleCompanyQuestions(message);
            if (companyResponse) {
                addMessage(companyResponse, 'bot', true);
                return;
            }
            
            // Check for social questions
            const socialResponse = handleSocialQuestions(message);
            if (socialResponse) {
                addMessage(socialResponse, 'bot', true);
                return;
            }
            
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
                    • "Quels sont vos services ?"<br><br>
                    <strong>Commandes disponibles :</strong><br>
                    • <strong>/help</strong> - Affiche cette aide<br>
                    • <strong>/reset</strong> - Efface la conversation<br>
                    • <strong>/clean</strong> - Recommence avec un langage propre
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
        
        if (command === '/clean' || command === 'clean') {
            // Reset profanity warnings and re-enable chat
            const previousWarnings = profanityWarnings;
            profanityWarnings = 0;
            chatbotInput.disabled = false;
            chatbotSend.disabled = false;
            chatbotInput.placeholder = "Tapez votre question...";
            
            let cleanMessage = '';
            if (previousWarnings > 0) {
                cleanMessage = `✨ <strong>Nouveau départ !</strong> Vos ${previousWarnings} avertissement${previousWarnings > 1 ? 's ont' : ' a'} été effacé${previousWarnings > 1 ? 's' : ''}. Continuons avec un langage respectueux ! 🤝`;
            } else {
                cleanMessage = "✨ <strong>Pas d'avertissement en cours !</strong> Continuez à utiliser un langage respectueux. 👍";
            }
            
            addMessage(cleanMessage, 'bot', true);
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