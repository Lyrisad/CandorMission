// ===== NEWS PAGE FUNCTIONALITY =====

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const newsSearchInput = document.getElementById('newsSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const clearSearchBtnLarge = document.getElementById('clearSearchBtnLarge');
    const searchResults = document.getElementById('searchResults');
    const searchResultsText = document.getElementById('searchResultsText');
    const sortSelect = document.getElementById('sortSelect');
    const newsLoading = document.getElementById('newsLoading');
    const articlesGrid = document.getElementById('articlesGrid');
    const newsEmpty = document.getElementById('newsEmpty');
    const noResults = document.getElementById('noResults');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const articleModal = document.getElementById('articleModal');
    const closeArticleModalBtn = document.getElementById('closeArticleModalBtn');
    const articleModalBody = document.getElementById('articleModalBody');
    const totalArticlesElement = document.getElementById('totalArticles');
    const latestUpdateElement = document.getElementById('latestUpdate');
    const newsletterEmail = document.getElementById('newsletterEmail');
    const newsletterSubmit = document.getElementById('newsletterSubmit');

    // State
    let allArticles = [];
    let filteredArticles = [];
    let displayedArticles = [];
    let currentSearchTerm = '';
    let currentSort = 'newest';
    let articlesPerPage = 6;
    let currentPage = 1;
    let isLoading = false;
    
    // Article tracking state
    let currentArticle = null;
    let articleStartTime = null;
    let articleTimeSpent = 0;

    // Initialize
    loadArticles();
    setupEventListeners();

    // Event Listeners
    function setupEventListeners() {
        // Search functionality
        if (newsSearchInput) {
            newsSearchInput.addEventListener('input', handleSearch);
            newsSearchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                }
            });
        }

        // Clear search buttons
        [clearSearchBtn, clearAllBtn, clearSearchBtnLarge].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', clearSearch);
            }
        });

        // Sort functionality
        if (sortSelect) {
            sortSelect.addEventListener('change', handleSort);
        }

        // Load more functionality
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMoreArticles);
        }

        // Modal functionality
        if (closeArticleModalBtn) {
            closeArticleModalBtn.addEventListener('click', closeArticleModal);
        }

        // Close modal when clicking outside
        if (articleModal) {
            articleModal.addEventListener('click', function(e) {
                if (e.target === articleModal) {
                    closeArticleModal();
                }
            });
        }

        // Newsletter subscription
        if (newsletterSubmit) {
            newsletterSubmit.addEventListener('click', handleNewsletterSubscription);
        }

        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && articleModal.style.display === 'block') {
                closeArticleModal();
            }
        });
    }

    // Load Articles
    function loadArticles() {
        showLoading();
        
        const url = `${GOOGLE_SCRIPT_URL}?action=readArticles`;
        console.log('🔍 Chargement des articles depuis:', url);
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                hideLoading();
                console.log('📄 Réponse articles:', data);
                if (data.success && data.values) {
                    console.log('✅ Articles bruts récupérés:', data.values.length);
                    allArticles = data.values.filter(article => article.visible);
                    console.log('✅ Articles visibles après filtrage:', allArticles.length);
                    console.log('📝 Premier article exemple:', allArticles[0]);
                    filteredArticles = [...allArticles];
                    displayedArticles = [];
                    currentPage = 1;
                    
                    updateHeroStats();
                    renderArticles();
                    updateSearchResults();
                } else {
                    console.log('❌ Pas d\'articles ou erreur:', data);
                    allArticles = [];
                    filteredArticles = [];
                    displayedArticles = [];
                    showEmptyState();
                }
            })
            .catch(error => {
                console.error('❌ Error loading articles:', error);
                hideLoading();
                allArticles = [];
                filteredArticles = [];
                displayedArticles = [];
                showEmptyState();
            });
    }

    // Update Hero Statistics
    function updateHeroStats() {
        if (totalArticlesElement) {
            totalArticlesElement.textContent = allArticles.length;
        }
        
        if (latestUpdateElement && allArticles.length > 0) {
            const latestArticle = allArticles[0]; // Assuming sorted by newest first
            const latestDate = new Date(latestArticle.cree_le);
            const now = new Date();
            
            // Reset time to compare only dates
            const latestDateOnly = new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate());
            const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            const diffTime = nowDateOnly.getTime() - latestDateOnly.getTime();
            const diffDays = Math.floor(Math.abs(diffTime) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                latestUpdateElement.textContent = 'Aujourd\'hui';
            } else if (diffDays === 1) {
                latestUpdateElement.textContent = 'Hier';
            } else if (diffDays < 7) {
                latestUpdateElement.textContent = `Il y a ${diffDays} jours`;
            } else {
                latestUpdateElement.textContent = latestDate.toLocaleDateString('fr-FR');
            }
        }
    }

    // Render Articles
    function renderArticles() {
        if (filteredArticles.length === 0) {
            if (allArticles.length === 0) {
                showEmptyState();
            } else {
                showNoResults();
            }
            return;
        }

        // Sort articles
        sortArticles();

        // Get articles for current page
        const startIndex = (currentPage - 1) * articlesPerPage;
        const endIndex = startIndex + articlesPerPage;
        const articlesToShow = filteredArticles.slice(startIndex, endIndex);

        // Add to displayed articles
        displayedArticles = [...displayedArticles, ...articlesToShow];

        // Render articles
        articlesToShow.forEach(article => {
            const articleElement = createArticleElement(article);
            articlesGrid.appendChild(articleElement);
        });

        // Show/hide load more button
        if (endIndex < filteredArticles.length) {
            loadMoreContainer.style.display = 'block';
        } else {
            loadMoreContainer.style.display = 'none';
        }

        // Show articles grid
        articlesGrid.style.display = 'grid';
        newsEmpty.style.display = 'none';
        noResults.style.display = 'none';
    }

    // Create Article Element
    function createArticleElement(article) {
        const element = document.createElement('div');
        element.className = 'article-card';
        element.addEventListener('click', () => openArticleModal(article));

        // Format date
        const articleDate = new Date(article.cree_le);
        const formattedDate = articleDate.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Check if article is new (less than 2 days old)
        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)); // 2 days in milliseconds
        const isNewArticle = articleDate > twoDaysAgo;

        // Create excerpt (first 150 characters, strip HTML tags)
        let excerpt = 'Aucun contenu disponible';
        if (article.contenu) {
            // Strip HTML tags for preview
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = article.contenu;
            const textContent = tempDiv.textContent || tempDiv.innerText || '';
            excerpt = textContent.length > 150 ? 
                textContent.substring(0, 150) + '...' : 
                textContent;
        }

        element.innerHTML = `
            <div class="article-image">
                ${article.image_url ? 
                    `<img src="${article.image_url}" alt="${article.titre}" onerror="this.parentElement.innerHTML='<div class=\\'article-image-placeholder\\'><i class=\\'fas fa-newspaper\\'></i></div>'">` :
                    `<div class="article-image-placeholder">
                        <i class="fas fa-newspaper"></i>
                    </div>`
                }
                ${isNewArticle ? `
                    <div class="new-article-badge">
                        <i class="fas fa-star"></i>
                        Nouveau !
                    </div>
                ` : ''}
            </div>
            <div class="article-content">
                <div class="article-meta">
                    <div class="article-date">
                        <i class="fas fa-calendar-alt"></i>
                        ${formattedDate}
                    </div>
                    ${article.auteur ? `
                        <div class="article-author">
                            <i class="fas fa-user"></i>
                            ${article.auteur}
                        </div>
                    ` : ''}
                </div>
                <h3 class="article-title" style="color: ${article.titre_couleur || '#2D1B69'};">${escapeHtml(article.titre)}</h3>
                <p class="article-excerpt">${escapeHtml(excerpt)}</p>
                <div class="article-footer">
                    <button class="read-more-btn">
                        Lire la suite
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;

        return element;
    }

    // Sort Articles
    function sortArticles() {
        switch (currentSort) {
            case 'newest':
                filteredArticles.sort((a, b) => new Date(b.cree_le) - new Date(a.cree_le));
                break;
            case 'oldest':
                filteredArticles.sort((a, b) => new Date(a.cree_le) - new Date(b.cree_le));
                break;
            case 'title':
                filteredArticles.sort((a, b) => a.titre.localeCompare(b.titre));
                break;
        }
    }

    // Handle Search
    function handleSearch() {
        const searchTerm = newsSearchInput.value.trim().toLowerCase();
        currentSearchTerm = searchTerm;

        if (searchTerm === '') {
            clearSearch();
            return;
        }

        filteredArticles = allArticles.filter(article => {
            return article.titre.toLowerCase().includes(searchTerm) ||
                   (article.contenu && article.contenu.toLowerCase().includes(searchTerm)) ||
                   (article.auteur && article.auteur.toLowerCase().includes(searchTerm));
        });

        // Reset pagination
        displayedArticles = [];
        currentPage = 1;
        articlesGrid.innerHTML = '';

        renderArticles();
        updateSearchResults();
    }

    // Clear Search
    function clearSearch() {
        newsSearchInput.value = '';
        currentSearchTerm = '';
        filteredArticles = [...allArticles];
        displayedArticles = [];
        currentPage = 1;
        articlesGrid.innerHTML = '';

        renderArticles();
        updateSearchResults();
        
        if (newsSearchInput) {
            newsSearchInput.focus();
        }
    }

    // Update Search Results
    function updateSearchResults() {
        if (currentSearchTerm && currentSearchTerm !== '') {
            const resultCount = filteredArticles.length;
            searchResultsText.textContent = `${resultCount} résultat${resultCount !== 1 ? 's' : ''} trouvé${resultCount !== 1 ? 's' : ''}`;
            searchResults.style.display = 'flex';
        } else {
            searchResults.style.display = 'none';
        }
    }

    // Handle Sort
    function handleSort() {
        currentSort = sortSelect.value;
        displayedArticles = [];
        currentPage = 1;
        articlesGrid.innerHTML = '';
        renderArticles();
    }

    // Load More Articles
    function loadMoreArticles() {
        if (isLoading) return;
        
        isLoading = true;
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';

        // Simulate loading delay
        setTimeout(() => {
            currentPage++;
            renderArticles();
            
            isLoading = false;
            loadMoreBtn.disabled = false;
            loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Charger plus d\'articles';
        }, 500);
    }

    // Open Article Modal
    function openArticleModal(article) {
        // Store current article for tracking
        currentArticle = article;
        articleStartTime = Date.now();
        articleTimeSpent = 0;
        
        // Debug: Log article info
        console.log('Article ouvert:', article);
        console.log('Article ID:', article.id);
        console.log('Article titre:', article.titre);
        
        // Ne pas tracker à l'ouverture, attendre la fermeture pour un tracking complet
        
        // Format date
        const articleDate = new Date(article.cree_le);
        const formattedDate = articleDate.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Check if article is new (less than 2 days old)
        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000));
        const isNewArticle = articleDate > twoDaysAgo;

        // Format content (detect if it's HTML or plain text)
        const formattedContent = article.contenu ? 
            (/<[a-z][\s\S]*>/i.test(article.contenu) ? 
                article.contenu : 
                article.contenu.replace(/\n/g, '<br>')) : 
            'Aucun contenu disponible';

        articleModalBody.innerHTML = `
            ${article.image_url ? `
                <div class="modal-article-image">
                    <img src="${article.image_url}" alt="${article.titre}" onerror="this.parentElement.innerHTML='<div class=\\'modal-article-image-placeholder\\'><i class=\\'fas fa-newspaper\\'></i></div>'">
                </div>
            ` : `
                <div class="modal-article-image">
                    <div class="modal-article-image-placeholder">
                        <i class="fas fa-newspaper"></i>
                    </div>
                </div>
            `}
            <div class="modal-article-meta">
                <div class="article-date">
                    <i class="fas fa-calendar-alt"></i>
                    ${formattedDate}
                </div>
                ${article.auteur ? `
                    <div class="article-author">
                        <i class="fas fa-user"></i>
                        ${article.auteur}
                    </div>
                ` : ''}
                ${article.modifie_le ? `
                    <div class="article-modified">
                        <i class="fas fa-edit"></i>
                        Modifié le ${new Date(article.modifie_le).toLocaleDateString('fr-FR')}
                    </div>
                ` : ''}
            </div>
            <h1 class="modal-article-title" style="color: ${article.titre_couleur || '#2D1B69'};">${escapeHtml(article.titre)}</h1>
            <div class="modal-article-content">
                ${formattedContent}
                <div class="article-signature">
                    <p><em>Cet article a été rédigé par un administrateur Candor Ma Mission</em></p>
                </div>
            </div>
        `;

        // Update modal header
        const modalHeader = articleModal.querySelector('.article-modal-header');
        modalHeader.innerHTML = `
            <div class="modal-header-content">
                <div class="modal-header-icon">
                    <i class="fas fa-newspaper"></i>
                </div>
            </div>
            <button class="close-modal-btn" id="closeArticleModalBtn">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Re-attach close button event listener
        const newCloseBtn = modalHeader.querySelector('#closeArticleModalBtn');
        if (newCloseBtn) {
            newCloseBtn.addEventListener('click', closeArticleModal);
        }

        // Show modal with animation
        articleModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Trigger animation after a small delay
        setTimeout(() => {
            articleModal.classList.add('show');
        }, 10);
    }

    // Close Article Modal
    function closeArticleModal() {
        // Calculate time spent if we have an article tracked
        if (currentArticle && articleStartTime) {
            const timeSpent = Math.round((Date.now() - articleStartTime) / 1000); // Convert to seconds
            console.log('Fermeture article:', currentArticle.titre, 'Temps passé:', timeSpent + 's');
            // Track even if 0 seconds (user opened the article)
            trackArticleClick(currentArticle, Math.max(timeSpent, 1)); // Minimum 1 second
        } else {
            console.log('Pas d\'article à tracker à la fermeture');
        }
        
        // Reset tracking variables
        currentArticle = null;
        articleStartTime = null;
        articleTimeSpent = 0;
        
        // Add closing animation
        articleModal.classList.add('closing');
        
        // Wait for animation to complete
        setTimeout(() => {
            articleModal.style.display = 'none';
            articleModal.classList.remove('show', 'closing');
            document.body.style.overflow = 'auto';
        }, 300);
    }

    // Handle Newsletter Subscription
    function handleNewsletterSubscription() {
        const email = newsletterEmail.value.trim();
        
        if (!email) {
            showToast('Veuillez saisir votre adresse email', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showToast('Veuillez saisir une adresse email valide', 'error');
            return;
        }

        // Show loading state
        newsletterSubmit.disabled = true;
        newsletterSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inscription...';

        // Simulate API call
        setTimeout(() => {
            showToast('Inscription à la newsletter réussie !', 'success');
            newsletterEmail.value = '';
            
            newsletterSubmit.disabled = false;
            newsletterSubmit.innerHTML = '<i class="fas fa-paper-plane"></i> S\'abonner';
        }, 2000);
    }

    // Show Loading State
    function showLoading() {
        newsLoading.style.display = 'block';
        articlesGrid.style.display = 'none';
        newsEmpty.style.display = 'none';
        noResults.style.display = 'none';
        loadMoreContainer.style.display = 'none';
    }

    // Hide Loading State
    function hideLoading() {
        newsLoading.style.display = 'none';
    }

    // Show Empty State
    function showEmptyState() {
        articlesGrid.style.display = 'none';
        newsEmpty.style.display = 'block';
        noResults.style.display = 'none';
        loadMoreContainer.style.display = 'none';
    }

    // Show No Results State
    function showNoResults() {
        articlesGrid.style.display = 'none';
        newsEmpty.style.display = 'none';
        noResults.style.display = 'block';
        loadMoreContainer.style.display = 'none';
    }

    // Utility Functions
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show Toast Notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                </div>
                <div class="toast-message">${message}</div>
                <button class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Style the toast
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                         type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 
                         'linear-gradient(135deg, #3b82f6, #1d4ed8)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            transform: translateX(400px);
            transition: all 0.3s ease;
            max-width: 400px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;

        // Add inner content styles
        const toastContent = toast.querySelector('.toast-content');
        toastContent.style.cssText = `
            display: flex;
            align-items: center;
            gap: 1rem;
        `;

        const toastIcon = toast.querySelector('.toast-icon');
        toastIcon.style.cssText = `
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            flex-shrink: 0;
        `;

        const toastMessage = toast.querySelector('.toast-message');
        toastMessage.style.cssText = `
            flex: 1;
            font-weight: 500;
        `;

        const toastClose = toast.querySelector('.toast-close');
        toastClose.style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            transition: background 0.3s ease;
            font-size: 1rem;
        `;

        // Add hover effect for close button
        toastClose.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(255, 255, 255, 0.2)';
        });

        toastClose.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
        });

        // Close toast functionality
        toastClose.addEventListener('click', function() {
            hideToast(toast);
        });

        // Add to body
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Auto hide after 4 seconds
        setTimeout(() => {
            hideToast(toast);
        }, 4000);
    }

    // Hide Toast
    function hideToast(toast) {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // Refresh articles (for potential future use)
    function refreshArticles() {
        loadArticles();
    }

    // Track Article Click and Time
    function trackArticleClick(article, timeSpent) {
        console.log('🎯 trackArticleClick appelé avec:', { article, timeSpent });
        
        if (!article || !article.id) {
            console.warn('❌ Article invalide pour le tracking:', article);
            console.warn('❌ ID manquant, propriétés disponibles:', Object.keys(article || {}));
            return;
        }
        
        const url = `${GOOGLE_SCRIPT_URL}?action=trackArticleClick&article_id=${encodeURIComponent(article.id)}&titre=${encodeURIComponent(article.titre)}&temps_cumule=${timeSpent}`;
        console.log('🌐 URL de tracking:', url);
        
        // Test mode: try without no-cors first to see response
        fetch(url, {
            method: 'GET'
        })
        .then(response => {
            console.log('📡 Réponse tracking (status):', response.status);
            return response.json();
        })
        .then(data => {
            console.log('📊 Réponse tracking (data):', data);
            if (data.success) {
                console.log(`✅ Article tracking réussi: ${article.titre} (${timeSpent}s)`);
            } else {
                console.error('❌ Erreur tracking:', data.error);
            }
        })
        .catch(error => {
            console.error('❌ Erreur lors du tracking article:', error);
            console.log('🔄 Tentative avec no-cors...');
            
            // Fallback with no-cors
            fetch(url, {
                method: 'GET',
                mode: 'no-cors'
            })
            .then(() => {
                console.log(`🔄 Article tracking envoyé (no-cors): ${article.titre} (${timeSpent}s)`);
            })
            .catch(fallbackError => {
                console.error('❌ Erreur même avec no-cors:', fallbackError);
            });
        });
    }
    
    // Get Article Statistics (for potential future use)
    function getArticleStats() {
        const url = `${GOOGLE_SCRIPT_URL}?action=getArticleStats`;
        
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Statistiques des articles:', data.stats);
                    return data.stats;
                } else {
                    console.error('Erreur lors de la récupération des statistiques:', data.error);
                    return null;
                }
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des statistiques:', error);
                return null;
            });
    }
    
    // Handle page visibility change to track time more accurately
    document.addEventListener('visibilitychange', function() {
        if (currentArticle && articleStartTime) {
            if (document.hidden) {
                // Page is hidden, pause tracking
                const timeSpent = Math.round((Date.now() - articleStartTime) / 1000);
                articleTimeSpent += timeSpent;
                articleStartTime = null;
            } else {
                // Page is visible again, resume tracking
                articleStartTime = Date.now();
            }
        }
    });
    
    // Handle page unload to save time before leaving
    window.addEventListener('beforeunload', function() {
        if (currentArticle && articleStartTime) {
            const timeSpent = Math.round((Date.now() - articleStartTime) / 1000);
            const totalTime = Math.max(articleTimeSpent + timeSpent, 1); // Minimum 1 second
            // Use navigator.sendBeacon for reliable tracking on page unload
            const url = `${GOOGLE_SCRIPT_URL}?action=trackArticleClick&article_id=${encodeURIComponent(currentArticle.id)}&titre=${encodeURIComponent(currentArticle.titre)}&temps_cumule=${totalTime}`;
            navigator.sendBeacon(url);
        }
    });
    
    // Expose functions globally for potential use
    window.refreshNewsArticles = refreshArticles;
    window.getArticleStats = getArticleStats;
}); 