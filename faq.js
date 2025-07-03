// FAQ Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const faqLoading = document.getElementById('faqLoading');
    const faqFilters = document.getElementById('faqFilters');
    const faqContainer = document.getElementById('faqContainer');
    const faqEmpty = document.getElementById('faqEmpty');
    const faqNoCategories = document.getElementById('faqNoCategories');
    const faqSearchInput = document.getElementById('faqSearchInput');
    const clearFaqSearchBtn = document.getElementById('clearFaqSearchBtn');
    const faqSearchResults = document.getElementById('faqSearchResults');
    const faqSearchResultsText = document.getElementById('faqSearchResultsText');
    const categoriesFilter = document.querySelector('.categories-filter');
    
    // State
    let categories = [];
    let faqs = [];
    let filteredFaqs = [];
    let currentCategory = 'all';
    
    // Initialize
    loadFAQData();
    
    // Event Listeners
    if (faqSearchInput) {
        faqSearchInput.addEventListener('input', handleSearch);
        faqSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
    }
    
    if (clearFaqSearchBtn) {
        clearFaqSearchBtn.addEventListener('click', clearSearch);
    }
    
    // Load FAQ data from Google Sheets
    function loadFAQData() {
        showLoading();
        
        // Load categories and FAQs in parallel
        Promise.all([
            loadCategories(),
            loadFAQs()
        ])
        .then(() => {
            if (categories.length === 0) {
                showNoCategories();
            } else {
                renderCategories();
                filterFAQs();
            }
        })
        .catch(error => {
            console.error('Error loading FAQ data:', error);
            showNoCategories();
        });
    }
    
    // Load categories from Google Sheets
    function loadCategories() {
        const url = `${GOOGLE_SCRIPT_URL}?action=readCategories`;
        
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.values) {
                    // Filter only visible categories
                    categories = data.values.filter(category => category.visible === true);
                } else {
                    categories = [];
                }
            })
            .catch(error => {
                console.error('Error loading categories:', error);
                categories = [];
            });
    }
    
    // Load FAQs from Google Sheets
    function loadFAQs() {
        const url = `${GOOGLE_SCRIPT_URL}?action=readFAQs`;
        
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.values) {
                    // Filter only visible FAQs
                    faqs = data.values.filter(faq => faq.visible === true);
                } else {
                    faqs = [];
                }
            })
            .catch(error => {
                console.error('Error loading FAQs:', error);
                faqs = [];
            });
    }
    
    // Render categories filter
    function renderCategories() {
        // Clear existing categories (except "All")
        const allButton = categoriesFilter.querySelector('[data-category="all"]');
        categoriesFilter.innerHTML = '';
        categoriesFilter.appendChild(allButton);
        
        // Add category buttons
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-btn';
            button.dataset.category = category.id;
            button.innerHTML = `
                <i class="fas fa-folder"></i>
                ${escapeHtml(category.nom)}
            `;
            
            button.addEventListener('click', () => {
                currentCategory = category.id;
                updateCategoryButtons();
                filterFAQs();
            });
            
            categoriesFilter.appendChild(button);
        });
        
        // Add event listener to "All" button
        allButton.addEventListener('click', () => {
            currentCategory = 'all';
            updateCategoryButtons();
            filterFAQs();
        });
        
        updateCategoryButtons();
    }
    
    // Update active category button
    function updateCategoryButtons() {
        const buttons = categoriesFilter.querySelectorAll('.category-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === currentCategory);
        });
    }
    
    // Filter FAQs by category and search
    function filterFAQs() {
        let filtered = [...faqs];
        
        // Filter by category
        if (currentCategory !== 'all') {
            filtered = filtered.filter(faq => faq.categorie === currentCategory);
        }
        
        // Filter by search term
        const searchTerm = faqSearchInput.value.trim().toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(faq => 
                faq.question.toLowerCase().includes(searchTerm) ||
                faq.reponse.toLowerCase().includes(searchTerm)
            );
        }
        
        filteredFaqs = filtered;
        renderFAQs();
        updateSearchResults();
    }
    
    // Render FAQ items
    function renderFAQs() {
        hideLoading();
        
        if (filteredFaqs.length === 0) {
            showEmpty();
            return;
        }
        
        // Group FAQs by category
        const faqsByCategory = {};
        
        filteredFaqs.forEach(faq => {
            const category = categories.find(cat => cat.id === faq.categorie);
            const categoryName = category ? category.nom : 'Autres';
            const categoryId = category ? category.id : 'autres';
            const categoryEmoji = category ? category.emoji || '❓' : '❓';
            
            if (!faqsByCategory[categoryId]) {
                faqsByCategory[categoryId] = {
                    name: categoryName,
                    description: category ? category.description : '',
                    emoji: categoryEmoji,
                    faqs: []
                };
            }
            
            faqsByCategory[categoryId].faqs.push(faq);
        });
        
        // Render categories
        faqContainer.innerHTML = '';
        
        Object.keys(faqsByCategory).forEach(categoryId => {
            const categoryData = faqsByCategory[categoryId];
            
            const categoryElement = document.createElement('div');
            categoryElement.className = 'faq-category';
            
            categoryElement.innerHTML = `
                <div class="faq-category-header">
                    <h2>
                        <div class="category-icon">
                            <span class="category-emoji">${categoryData.emoji}</span>
                        </div>
                        ${escapeHtml(categoryData.name)}
                    </h2>
                    ${categoryData.description ? `<div class="faq-category-description">${escapeHtml(categoryData.description)}</div>` : ''}
                </div>
                <div class="faq-items">
                    ${categoryData.faqs.map(faq => createFAQItem(faq)).join('')}
                </div>
            `;
            
            faqContainer.appendChild(categoryElement);
        });
        
        // Add click events to FAQ questions
        addFAQEventListeners();
        
        // Show container
        faqContainer.style.display = 'block';
        faqFilters.style.display = 'block';
        faqEmpty.style.display = 'none';
        faqNoCategories.style.display = 'none';
    }
    
    // Create FAQ item HTML
    function createFAQItem(faq) {
        const searchTerm = faqSearchInput.value.trim().toLowerCase();
        let question = escapeHtml(faq.question);
        let answer = escapeHtml(faq.reponse);
        
        // Highlight search terms
        if (searchTerm) {
            const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
            question = question.replace(regex, '<span class="search-highlight">$1</span>');
            answer = answer.replace(regex, '<span class="search-highlight">$1</span>');
        }
        
        return `
            <div class="faq-item" data-faq-id="${faq.id}">
                <button class="faq-question" data-faq-id="${faq.id}">
                    <span class="faq-question-text">${question}</span>
                    <div class="faq-toggle">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </button>
                <div class="faq-answer" data-faq-id="${faq.id}">
                    <div class="faq-answer-content">${answer.replace(/\n/g, '<br>')}</div>
                </div>
            </div>
        `;
    }
    
    // Add event listeners to FAQ items
    function addFAQEventListeners() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                const faqId = this.dataset.faqId;
                toggleFAQ(faqId);
            });
        });
    }
    
    // Toggle FAQ answer
    function toggleFAQ(faqId) {
        const question = document.querySelector(`.faq-question[data-faq-id="${faqId}"]`);
        const answer = document.querySelector(`.faq-answer[data-faq-id="${faqId}"]`);
        
        if (!question || !answer) return;
        
        const isActive = question.classList.contains('active');
        
        // Close all other FAQs in the same category
        const categoryElement = question.closest('.faq-category');
        const allQuestions = categoryElement.querySelectorAll('.faq-question');
        const allAnswers = categoryElement.querySelectorAll('.faq-answer');
        
        allQuestions.forEach(q => q.classList.remove('active'));
        allAnswers.forEach(a => a.classList.remove('active'));
        
        // Toggle current FAQ
        if (!isActive) {
            question.classList.add('active');
            answer.classList.add('active');
            
            // Track FAQ click
            trackFAQClick(faqId, question);
        }
    }
    
    // Track FAQ click
    function trackFAQClick(faqId, questionElement) {
        // Get the question text (remove highlighting if present)
        const questionTextElement = questionElement.querySelector('.faq-question-text');
        if (!questionTextElement) return;
        
        // Clean the question text by removing HTML tags and getting only the text content
        const questionText = questionTextElement.textContent.trim();
        
        // Create the URL with parameters
        const url = `${GOOGLE_SCRIPT_URL}?action=trackFAQClick&question_id=${encodeURIComponent(faqId)}&question=${encodeURIComponent(questionText)}&timestamp=${Date.now()}`;
        
        // Send the tracking request using fetch with no-cors mode
        fetch(url, {
            method: 'GET',
            mode: 'no-cors'
        })
        .then(() => {
            console.log('FAQ click tracked successfully:', faqId);
        })
        .catch(error => {
            console.warn('Error tracking FAQ click:', error);
        });
    }
    
    // Handle search
    function handleSearch() {
        const searchTerm = faqSearchInput.value.trim();
        
        if (searchTerm === '') {
            clearFaqSearchBtn.style.display = 'none';
        } else {
            clearFaqSearchBtn.style.display = 'block';
        }
        
        filterFAQs();
    }
    
    // Clear search
    function clearSearch() {
        faqSearchInput.value = '';
        clearFaqSearchBtn.style.display = 'none';
        filterFAQs();
        faqSearchInput.focus();
    }
    
    // Update search results text
    function updateSearchResults() {
        const searchTerm = faqSearchInput.value.trim();
        
        if (searchTerm && searchTerm !== '') {
            const resultCount = filteredFaqs.length;
            faqSearchResultsText.textContent = `${resultCount} résultat${resultCount !== 1 ? 's' : ''} trouvé${resultCount !== 1 ? 's' : ''}`;
            faqSearchResults.style.display = 'block';
        } else {
            faqSearchResults.style.display = 'none';
        }
    }
    
    // Show loading state
    function showLoading() {
        faqLoading.style.display = 'block';
        faqFilters.style.display = 'none';
        faqContainer.style.display = 'none';
        faqEmpty.style.display = 'none';
        faqNoCategories.style.display = 'none';
    }
    
    // Hide loading state
    function hideLoading() {
        faqLoading.style.display = 'none';
    }
    
    // Show empty state
    function showEmpty() {
        faqContainer.style.display = 'none';
        faqEmpty.style.display = 'block';
        faqNoCategories.style.display = 'none';
        faqFilters.style.display = 'block';
    }
    
    // Show no categories state
    function showNoCategories() {
        hideLoading();
        faqFilters.style.display = 'none';
        faqContainer.style.display = 'none';
        faqEmpty.style.display = 'none';
        faqNoCategories.style.display = 'block';
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Escape regex special characters
    function escapeRegex(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}); 