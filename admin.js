// Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const loginForm = document.getElementById('adminLoginForm');
    const loginContainer = document.getElementById('loginForm');
    const dashboardContainer = document.getElementById('dashboard');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Logs elements
    const refreshLogsBtn = document.getElementById('refreshLogsBtn');
    const exportLogsBtn = document.getElementById('exportLogsBtn');
    const logsLoading = document.getElementById('logsLoading');
    const logsTableContainer = document.getElementById('logsTableContainer');
    const logsTableBody = document.getElementById('logsTableBody');
    const logsEmpty = document.getElementById('logsEmpty');
    const logsSearchInput = document.getElementById('logsSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const searchResults = document.getElementById('searchResults');
    const searchResultsText = document.getElementById('searchResultsText');
    
    // Logs state
    let allLogs = [];
    let filteredLogs = [];
    
    // Check if user is already logged in
    checkLoginStatus();
    
    // Toggle password visibility
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const username = formData.get('username');
            const password = formData.get('password');
            const remember = formData.get('remember');
            
            // Basic validation
            if (!username || !password) {
                showError('Veuillez remplir tous les champs.');
                return;
            }
            
            // Simulate login (replace with real authentication)
            performLogin(username, password, remember);
        });
    }
    
    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            performLogout();
        });
    }
    
    // Logs functionality
    if (refreshLogsBtn) {
        refreshLogsBtn.addEventListener('click', loadLogs);
    }
    
    if (exportLogsBtn) {
        exportLogsBtn.addEventListener('click', exportLogs);
    }
    
    // Search functionality
    if (logsSearchInput) {
        logsSearchInput.addEventListener('input', handleLogsSearch);
        logsSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleLogsSearch();
            }
        });
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearLogsSearch);
    }
    
    // Login function
    function performLogin(username, password, remember) {
        // Show loading state
        const loginBtn = document.querySelector('.login-btn');
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
        loginBtn.disabled = true;
        
        // Simulate API call delay
        setTimeout(() => {
            // Check credentials
            if (username === 'admin' && password === 'admin123') {
                // Store login state
                const loginData = {
                    username: username,
                    timestamp: new Date().getTime(),
                    remember: remember
                };
                
                if (remember) {
                    localStorage.setItem('adminLogin', JSON.stringify(loginData));
                } else {
                    sessionStorage.setItem('adminLogin', JSON.stringify(loginData));
                }
                
                // Add log entry
                addLog('Connexion admin');
                
                // Show success animation
                showLoginSuccess();
                
                // Switch to dashboard after animation
                setTimeout(() => {
                    showDashboard();
                    loadDashboardData();
                }, 1500);
                
            } else {
                // Add log entry for failed login
                addLog('Tentative de connexion échouée');
                
                showError('🔐 Identifiants incorrects. <br> Veuillez réessayer.');
                resetLoginButton(loginBtn, originalText);
            }
        }, 2000);
    }
    
    // Logout function
    function performLogout() {
        // Add log entry
        addLog('Déconnexion admin');
        
        // Clear stored login data
        localStorage.removeItem('adminLogin');
        sessionStorage.removeItem('adminLogin');
        
        // Show logout animation
        showLogoutAnimation();
        
        // Switch back to login form
        setTimeout(() => {
            showLoginForm();
        }, 1000);
    }
    
    // Check login status
    function checkLoginStatus() {
        const loginData = localStorage.getItem('adminLogin') || sessionStorage.getItem('adminLogin');
        
        if (loginData) {
            const data = JSON.parse(loginData);
            const now = new Date().getTime();
            const loginTime = data.timestamp;
            
            // Check if login is still valid (24 hours)
            if (now - loginTime < 24 * 60 * 60 * 1000) {
                showDashboard();
                loadDashboardData();
            } else {
                // Login expired
                localStorage.removeItem('adminLogin');
                sessionStorage.removeItem('adminLogin');
                showLoginForm();
            }
        } else {
            showLoginForm();
        }
    }
    
    // Show dashboard
    function showDashboard() {
        loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        
        // Hide FAQ management section if it exists
        const faqSection = document.getElementById('faqManagementSection');
        if (faqSection) {
            faqSection.style.display = 'none';
        }
        
        // Show dashboard elements
        const dashCards = document.querySelector('.dashboard-cards');
        const logsEl = document.querySelector('.logs-section');
        if (dashCards) dashCards.style.display = 'grid';
        if (logsEl) logsEl.style.display = 'block';
        
        // Add entrance animation
        dashboardContainer.style.opacity = '0';
        dashboardContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            dashboardContainer.style.transition = 'all 0.5s ease';
            dashboardContainer.style.opacity = '1';
            dashboardContainer.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Show login form
    function showLoginForm() {
        dashboardContainer.style.display = 'none';
        loginContainer.style.display = 'block';
        
        // Reset form
        if (loginForm) {
            loginForm.reset();
        }
    }
    
    // Load dashboard data
    function loadDashboardData() {
        // Simulate loading dashboard statistics
        animateCounter('messageCount', 0, 42, 2000);
        animateCounter('visitorCount', 0, 1250, 2500);
        animateCounter('performanceScore', 0, 98, 3000);
        
        // Load unread message count
        loadUnreadCount();
        
        // Load message statistics
        loadMessageStats();
        
        // Load FAQ statistics
        loadFAQStats();
        
        // Load news statistics
        loadNewsStats();
        
        // Load logs
        loadLogs();
    }
    
    // Load unread message count
    function loadUnreadCount() {
        const url = `${GOOGLE_SCRIPT_URL}?action=getUnreadCount`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const unreadCount = data.count || 0;
                    const unreadBadge = document.getElementById('unreadBadge');
                    const unreadCountElement = document.getElementById('unreadCount');
                    
                    if (unreadCount > 0) {
                        unreadCountElement.textContent = unreadCount;
                        unreadBadge.style.display = 'inline-block';
                    } else {
                        unreadBadge.style.display = 'none';
                    }
                }
            })
            .catch(error => {
                console.error('Error loading unread count:', error);
            });
    }
    
    // Load FAQ statistics
    function loadFAQStats() {
        const url = `${GOOGLE_SCRIPT_URL}?action=getFAQStats`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.stats) {
                    const stats = data.stats;
                    
                    // Update FAQ card with statistics
                    const faqCard = document.querySelector('.admin-card:nth-child(2)');
                    if (faqCard) {
                        const cardContent = faqCard.querySelector('.card-content');
                        const existingStats = cardContent.querySelector('.faq-stats');
                        const placeholder = cardContent.querySelector('#faqStatsPlaceholder');
                        
                        // Create stats element
                        const statsElement = document.createElement('div');
                        statsElement.className = 'faq-stats';
                        statsElement.innerHTML = `
                            <div class="stats-container">
                                <div class="stat-item">
                                    <span class="stat-number">${stats.visibleCategories}</span>
                                    <span class="stat-label">Catégories</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number">${stats.visibleQuestions}</span>
                                    <span class="stat-label">Questions</span>
                                </div>
                            </div>
                        `;
                        
                        // If placeholder exists, replace it with animation
                        if (placeholder) {
                            // Add fade out animation to placeholder
                            placeholder.style.transition = 'all 0.5s ease';
                            placeholder.style.opacity = '0';
                            placeholder.style.transform = 'scale(0.95)';
                            
                            setTimeout(() => {
                                // Replace placeholder with real stats
                                placeholder.replaceWith(statsElement);
                                
                                // Add fade in animation to new stats
                                statsElement.style.opacity = '0';
                                statsElement.style.transform = 'scale(0.95)';
                                
                                setTimeout(() => {
                                    statsElement.style.transition = 'all 0.5s ease';
                                    statsElement.style.opacity = '1';
                                    statsElement.style.transform = 'scale(1)';
                                }, 50);
                            }, 500);
                        } else {
                            // Remove existing stats if any
                            if (existingStats) {
                                existingStats.remove();
                            }
                            
                            // Insert stats before the button
                            const cardBtn = cardContent.querySelector('.card-btn');
                            if (cardBtn) {
                                cardContent.insertBefore(statsElement, cardBtn);
                            } else {
                                cardContent.appendChild(statsElement);
                            }
                            
                            // Add fade in animation
                            statsElement.style.opacity = '0';
                            statsElement.style.transform = 'scale(0.95)';
                            
                            setTimeout(() => {
                                statsElement.style.transition = 'all 0.5s ease';
                                statsElement.style.opacity = '1';
                                statsElement.style.transform = 'scale(1)';
                            }, 50);
                        }
                    }
                } else {
                    // If no data, show error state in placeholder
                    const placeholder = document.querySelector('#faqStatsPlaceholder');
                    if (placeholder) {
                        placeholder.innerHTML = `
                            <div class="stats-container">
                                <div class="stat-item">
                                    <span class="stat-number">--</span>
                                    <span class="stat-label">Catégories</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number">--</span>
                                    <span class="stat-label">Questions</span>
                                </div>
                            </div>
                        `;
                        placeholder.style.animation = 'none';
                        placeholder.style.opacity = '0.6';
                    }
                }
            })
            .catch(error => {
                console.error('Error loading FAQ stats:', error);
                
                // Show error state in placeholder
                const placeholder = document.querySelector('#faqStatsPlaceholder');
                if (placeholder) {
                    placeholder.innerHTML = `
                        <div class="stats-container">
                            <div class="stat-item">
                                <span class="stat-number">--</span>
                                <span class="stat-label">Catégories</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">--</span>
                                <span class="stat-label">Questions</span>
                            </div>
                        </div>
                    `;
                    placeholder.style.animation = 'none';
                    placeholder.style.opacity = '0.6';
                }
            });
    }
    
    // Animate counter
    function animateCounter(elementId, start, end, duration) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const startTime = performance.now();
        const isPercentage = elementId === 'performanceScore';
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (end - start) * easeOutQuart);
            
            element.textContent = isPercentage ? current + '%' : current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    }
    
    // Show login success animation
    function showLoginSuccess() {
        const loginCard = document.querySelector('.login-card');
        loginCard.style.transform = 'scale(1.05)';
        loginCard.style.boxShadow = '0 30px 60px rgba(59, 130, 246, 0.4)';
        
        // Create stylish toast notification
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="toast-text">
                    <h4>Connexion réussie !</h4>
                    <p>Bienvenue dans le panel admin</p>
                </div>
                <button class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add toast styles
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 1.5rem;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(16, 185, 129, 0.3);
            z-index: 10000;
            transform: translateX(400px);
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            min-width: 350px;
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
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            flex-shrink: 0;
        `;
        
        const toastText = toast.querySelector('.toast-text');
        toastText.style.cssText = `
            flex: 1;
        `;
        
        const toastTitle = toast.querySelector('.toast-text h4');
        toastTitle.style.cssText = `
            margin: 0 0 0.25rem 0;
            font-size: 1.1rem;
            font-weight: 600;
        `;
        
        const toastDesc = toast.querySelector('.toast-text p');
        toastDesc.style.cssText = `
            margin: 0;
            font-size: 0.9rem;
            opacity: 0.9;
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
    
    // Hide toast function
    function hideToast(toast) {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 500);
    }
    
    // Show logout animation
    function showLogoutAnimation() {
        const dashboard = document.querySelector('.dashboard-container');
        dashboard.style.transform = 'translateY(-20px)';
        dashboard.style.opacity = '0';
        dashboard.style.transition = 'all 0.5s ease';
    }
    
    // Show error message
    function showError(message) {
        // Remove existing error
        const existingError = document.querySelector('.login-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'login-error';
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
        const form = document.querySelector('.login-form');
        if (form) {
            form.insertBefore(errorDiv, form.firstChild);
        }
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    // Reset login button
    function resetLoginButton(button, originalText) {
        button.innerHTML = originalText;
        button.disabled = false;
    }
    
    // Add hover effects to action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + L to logout
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            if (dashboardContainer.style.display !== 'none') {
                performLogout();
            }
        }
        
        // Escape to go back to login
        if (e.key === 'Escape' && dashboardContainer.style.display !== 'none') {
            performLogout();
        }
    });
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
        
        .login-card {
            transition: all 0.3s ease;
        }
        
        .dashboard-container {
            transition: all 0.5s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Load logs
    function loadLogs() {
        showLogsLoading();
        
        const url = `${GOOGLE_SCRIPT_URL}?action=readLogs`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                hideLogsLoading();
                if (data.success && data.values) {
                    allLogs = data.values;
                    filteredLogs = [...allLogs]; // Copy all logs initially
                    renderLogs(filteredLogs);
                    updateSearchResults();
                } else {
                    allLogs = [];
                    filteredLogs = [];
                    showLogsEmpty();
                }
            })
            .catch(error => {
                console.error('Error loading logs:', error);
                hideLogsLoading();
                allLogs = [];
                filteredLogs = [];
                showLogsEmpty();
            });
    }
    
    // Format date to dd/mm/yyyy
    function formatLogDate(dateStr) {
        if (!dateStr) return 'N/A';
        
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr; // Return original if invalid
            
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            
            return `${day}/${month}/${year}`;
        } catch (error) {
            return dateStr; // Return original if error
        }
    }
    
    // Format time to 02h33m23s
    function formatLogTime(timeStr) {
        if (!timeStr) return 'N/A';
        
        try {
            // If it's already in the correct format (e.g., "13h39m49s"), return as is
            if (timeStr.includes('h') && timeStr.includes('m') && timeStr.includes('s')) {
                return timeStr;
            }
            
            // If it's a full datetime string like "1899-12-30T13h39m49s"
            if (timeStr.includes('T')) {
                // Extract only the time part after 'T'
                const timePart = timeStr.split('T')[1];
                
                // If it already has the h/m/s format, just return it as is
                if (timePart.includes('h') && timePart.includes('m')) {
                    // Remove any trailing characters and ensure it ends with 's'
                    let cleanTime = timePart.replace(/[Z]*$/, ''); // Remove Z but keep s
                    cleanTime = cleanTime.replace(/\.\d+/, ''); // Remove milliseconds
                    return cleanTime;
                }
            }
            
            // If it's a standard time format like "16:33:42"
            const timeParts = timeStr.split(':');
            if (timeParts.length >= 2) {
                const hours = String(timeParts[0]).padStart(2, '0');
                const minutes = String(timeParts[1]).padStart(2, '0');
                const seconds = timeParts[2] ? String(Math.floor(parseFloat(timeParts[2]))).padStart(2, '0') : '00';
                
                return `${hours}h${minutes}m${seconds}s`;
            }
            
            return timeStr; // Return original if can't parse
        } catch (error) {
            console.error('Error formatting time:', error);
            return timeStr; // Return original if error
        }
    }
    
    // Format log action text
    function formatLogAction(action) {
        if (!action) return '';
        
        // Actions are now properly formatted in Google Apps Script
        // This function is kept for backward compatibility
        return action;
    }
    
    // Render logs
    function renderLogs(logs) {
        if (!logs || logs.length === 0) {
            showLogsEmpty();
            return;
        }
        
        logsTableBody.innerHTML = '';
        
        // Sort logs by ID (newest first - higher ID = more recent)
        logs.sort((a, b) => {
            // Convert IDs to numbers for proper sorting
            const idA = parseInt(a.id) || 0;
            const idB = parseInt(b.id) || 0;
            return idB - idA; // Descending order (newest first)
        });
        
        logs.forEach(log => {
            const row = document.createElement('tr');
            const formattedDate = formatLogDate(log.date);
            const formattedTime = formatLogTime(log.heure);
            const formattedAction = formatLogAction(log.action);
            
            row.innerHTML = `
                <td>${escapeHtml(log.id)}</td>
                <td>${escapeHtml(formattedDate)}</td>
                <td>${escapeHtml(formattedTime)}</td>
                <td>
                    <span class="log-action ${getActionClass(formattedAction)}">
                        ${escapeHtml(formattedAction)}
                    </span>
                </td>
                <td>${escapeHtml(log.ip)}</td>
            `;
            logsTableBody.appendChild(row);
        });
        
        logsTableContainer.style.display = 'block';
        logsEmpty.style.display = 'none';
    }
    
    // Get CSS class for action type
    function getActionClass(action) {
        const actionLower = action.toLowerCase();
        if (actionLower.includes('archiv')) return 'action-archive';
        if (actionLower.includes('supprim')) return 'action-delete';
        if (actionLower.includes('restaur')) return 'action-restore';
        if (actionLower.includes('connexion')) return 'action-login';
        if (actionLower.includes('déconnexion')) return 'action-logout';
        return 'action-default';
    }
    
    // Show logs loading
    function showLogsLoading() {
        logsLoading.style.display = 'block';
        logsTableContainer.style.display = 'none';
        logsEmpty.style.display = 'none';
    }
    
    // Hide logs loading
    function hideLogsLoading() {
        logsLoading.style.display = 'none';
    }
    
    // Show logs empty state
    function showLogsEmpty() {
        logsTableContainer.style.display = 'none';
        logsEmpty.style.display = 'block';
    }
    
    // Export logs
    function exportLogs() {
        const url = `${GOOGLE_SCRIPT_URL}?action=exportLogs`;
        
        // Show loading state
        const exportBtn = document.getElementById('exportLogsBtn');
        const originalText = exportBtn.innerHTML;
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Export en cours...';
        exportBtn.disabled = true;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.csv) {
                    // Create blob from CSV content
                    const blob = new Blob([data.csv], { type: 'text/csv;charset=utf-8;' });
                    
                    // Create temporary link to download
                    const link = document.createElement('a');
                    const filename = data.filename || `logs_${new Date().toISOString().split('T')[0]}.csv`;
                    
                    // Create download URL
                    if (navigator.msSaveBlob) {
                        // IE 10+
                        navigator.msSaveBlob(blob, filename);
                    } else {
                        // Other browsers
                        link.href = URL.createObjectURL(blob);
                        link.download = filename;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        // Clean up the URL object
                        URL.revokeObjectURL(link.href);
                    }
                    
                    // Show success message
                    showSuccessToast('📊 Logs exportés avec succès !');
                    
                } else {
                    showErrorToast('❌ Erreur lors de l\'export: ' + (data.error || 'Réponse invalide'));
                }
            })
            .catch(error => {
                console.error('Error exporting logs:', error);
                showErrorToast('❌ Erreur de connexion lors de l\'export');
            })
            .finally(() => {
                // Reset button state
                exportBtn.innerHTML = originalText;
                exportBtn.disabled = false;
            });
    }
    
    // Show success toast notification
    function showSuccessToast(message) {
        showToast(message, 'success');
    }
    
    // Show error toast notification
    function showErrorToast(message) {
        showToast(message, 'error');
    }
    
    // Show toast notification
    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `export-toast toast-${type}`;
        toast.innerHTML = message;
        
        // Style the toast
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            padding: 1rem 2rem;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;
        
        if (type === 'success') {
            toast.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        } else {
            toast.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        }
        
        document.body.appendChild(toast);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Add log entry
    function addLog(action) {
        // Get user IP address
        let userIP = 'N/A';
        
        // Try to get IP from various sources
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                userIP = data.ip;
                sendLog(action, userIP);
            })
            .catch(error => {
                console.log('Could not get IP from ipify, using fallback');
                sendLog(action, userIP);
            });
    }
    
    // Send log to server
    function sendLog(action, ip) {
        const url = `${GOOGLE_SCRIPT_URL}?action=addLog&logMessage=${encodeURIComponent(action)}&ip=${encodeURIComponent(ip)}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Log added successfully:', action);
                } else {
                    console.error('Error adding log:', data.error);
                }
            })
            .catch(error => {
                console.error('Error adding log:', error);
            });
    }
    
    // Handle logs search
    function handleLogsSearch() {
        const searchTerm = logsSearchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            filteredLogs = [...allLogs];
            clearSearchBtn.style.display = 'none';
        } else {
            filteredLogs = allLogs.filter(log => {
                return log.action.toLowerCase().includes(searchTerm) ||
                       log.ip.toLowerCase().includes(searchTerm) ||
                       log.date.toLowerCase().includes(searchTerm) ||
                       log.heure.toLowerCase().includes(searchTerm) ||
                       log.id.toString().toLowerCase().includes(searchTerm);
            });
            clearSearchBtn.style.display = 'block';
        }
        
        renderLogs(filteredLogs);
        updateSearchResults();
    }
    
    // Clear logs search
    function clearLogsSearch() {
        logsSearchInput.value = '';
        filteredLogs = [...allLogs];
        clearSearchBtn.style.display = 'none';
        renderLogs(filteredLogs);
        updateSearchResults();
        logsSearchInput.focus();
    }
    
    // Update search results text
    function updateSearchResults() {
        const searchTerm = logsSearchInput.value.trim();
        
        if (searchTerm && searchTerm !== '') {
            const resultCount = filteredLogs.length;
            searchResultsText.textContent = `${resultCount} résultat${resultCount !== 1 ? 's' : ''} trouvé${resultCount !== 1 ? 's' : ''}`;
            searchResults.style.display = 'block';
        } else {
            searchResults.style.display = 'none';
        }
    }
    
    // ===== FAQ MANAGEMENT FUNCTIONALITY =====
    
    // FAQ Management Elements
    const manageFaqBtn = document.getElementById('manageFaqBtn');
    const faqManagementSection = document.getElementById('faqManagementSection');
    const backToDashboardBtn = document.getElementById('backToDashboardBtn');
    const refreshFaqBtn = document.getElementById('refreshFaqBtn');
    const dashboardCards = document.querySelector('.dashboard-cards');
    const logsSection = document.querySelector('.logs-section');
    
    // FAQ Tab Elements
    const faqTabBtns = document.querySelectorAll('.faq-tab-btn');
    const categoriesTab = document.getElementById('categoriesTab');
    const questionsTab = document.getElementById('questionsTab');
    
    // Categories Elements
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const categoriesLoading = document.getElementById('categoriesLoading');
    const categoriesList = document.getElementById('categoriesList');
    const categoriesEmpty = document.getElementById('categoriesEmpty');
    
    // Categories Search Elements
    const categoriesSearchInput = document.getElementById('categoriesSearchInput');
    const clearCategoriesSearchBtn = document.getElementById('clearCategoriesSearchBtn');
    const categoriesSearchResults = document.getElementById('categoriesSearchResults');
    const categoriesSearchResultsText = document.getElementById('categoriesSearchResultsText');
    
    // Questions Elements
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const questionsLoading = document.getElementById('questionsLoading');
    const questionsList = document.getElementById('questionsList');
    const questionsEmpty = document.getElementById('questionsEmpty');
    const questionCategoryFilter = document.getElementById('questionCategoryFilter');
    
    // Questions Search Elements
    const questionsSearchInput = document.getElementById('questionsSearchInput');
    const clearQuestionsSearchBtn = document.getElementById('clearQuestionsSearchBtn');
    const questionsSearchResults = document.getElementById('questionsSearchResults');
    const questionsSearchResultsText = document.getElementById('questionsSearchResultsText');
    
    // Modal Elements
    const categoryModal = document.getElementById('categoryModal');
    const questionModal = document.getElementById('questionModal');
    const closeCategoryModalBtn = document.getElementById('closeCategoryModalBtn');
    const closeQuestionModalBtn = document.getElementById('closeQuestionModalBtn');
    const categoryForm = document.getElementById('categoryForm');
    const questionForm = document.getElementById('questionForm');
    const saveCategoryBtn = document.getElementById('saveCategoryBtn');
    const saveQuestionBtn = document.getElementById('saveQuestionBtn');
    const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
    const cancelQuestionBtn = document.getElementById('cancelQuestionBtn');
    
    // Delete Confirmation Modal Elements
    const deleteCategoryModal = document.getElementById('deleteCategoryModal');
    const deleteQuestionModal = document.getElementById('deleteQuestionModal');
    const closeDeleteCategoryModalBtn = document.getElementById('closeDeleteCategoryModalBtn');
    const closeDeleteQuestionModalBtn = document.getElementById('closeDeleteQuestionModalBtn');
    const cancelDeleteCategoryBtn = document.getElementById('cancelDeleteCategoryBtn');
    const cancelDeleteQuestionBtn = document.getElementById('cancelDeleteQuestionBtn');
    const confirmDeleteCategoryBtn = document.getElementById('confirmDeleteCategoryBtn');
    const confirmDeleteQuestionBtn = document.getElementById('confirmDeleteQuestionBtn');
    const deleteCategoryName = document.getElementById('deleteCategoryName');
    const deleteCategoryQuestionCount = document.getElementById('deleteCategoryQuestionCount');
    const deleteQuestionText = document.getElementById('deleteQuestionText');
    
    // Delete confirmation state
    let categoryToDelete = null;
    let questionToDelete = null;
    
    // FAQ State
    let faqCategories = [];
    let faqQuestions = [];
    let filteredCategories = [];
    let filteredQuestions = [];
    let currentEditingCategory = null;
    let currentEditingQuestion = null;
    let currentQuestionCategoryFilter = 'all';
    let currentCategoriesSearchTerm = '';
    let currentQuestionsSearchTerm = '';
    
    // FAQ Event Listeners
    if (manageFaqBtn) {
        manageFaqBtn.addEventListener('click', showFAQManagement);
    }
    
    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', returnToDashboard);
    }
    
    if (refreshFaqBtn) {
        refreshFaqBtn.addEventListener('click', refreshFAQData);
    }
    
    // Tab switching
    faqTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchFAQTab(tab);
        });
    });
    
    // Category management
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => openCategoryModal());
    }
    
    if (saveCategoryBtn) {
        saveCategoryBtn.addEventListener('click', saveCategory);
    }
    
    if (cancelCategoryBtn || closeCategoryModalBtn) {
        [cancelCategoryBtn, closeCategoryModalBtn].forEach(btn => {
            if (btn) btn.addEventListener('click', closeCategoryModal);
        });
    }
    
    // Question management
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', () => openQuestionModal());
    }
    
    if (saveQuestionBtn) {
        saveQuestionBtn.addEventListener('click', saveQuestion);
    }
    
    if (cancelQuestionBtn || closeQuestionModalBtn) {
        [cancelQuestionBtn, closeQuestionModalBtn].forEach(btn => {
            if (btn) btn.addEventListener('click', closeQuestionModal);
        });
    }
    
    if (questionCategoryFilter) {
        questionCategoryFilter.addEventListener('change', (e) => {
            currentQuestionCategoryFilter = e.target.value;
            renderQuestions();
        });
    }
    
    // Categories search
    if (categoriesSearchInput) {
        categoriesSearchInput.addEventListener('input', handleCategoriesSearch);
        categoriesSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleCategoriesSearch();
            }
        });
    }
    
    if (clearCategoriesSearchBtn) {
        clearCategoriesSearchBtn.addEventListener('click', clearCategoriesSearch);
    }
    
    // Questions search
    if (questionsSearchInput) {
        questionsSearchInput.addEventListener('input', handleQuestionsSearch);
        questionsSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleQuestionsSearch();
            }
        });
    }
    
    if (clearQuestionsSearchBtn) {
        clearQuestionsSearchBtn.addEventListener('click', clearQuestionsSearch);
    }
    
    // Close modals when clicking outside
    [categoryModal, questionModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    if (modal === categoryModal) closeCategoryModal();
                    if (modal === questionModal) closeQuestionModal();
                }
            });
        }
    });
    
    // Delete confirmation modal event listeners
    if (closeDeleteCategoryModalBtn) {
        closeDeleteCategoryModalBtn.addEventListener('click', closeDeleteCategoryModal);
    }
    
    if (closeDeleteQuestionModalBtn) {
        closeDeleteQuestionModalBtn.addEventListener('click', closeDeleteQuestionModal);
    }
    
    if (cancelDeleteCategoryBtn) {
        cancelDeleteCategoryBtn.addEventListener('click', closeDeleteCategoryModal);
    }
    
    if (cancelDeleteQuestionBtn) {
        cancelDeleteQuestionBtn.addEventListener('click', closeDeleteQuestionModal);
    }
    
    if (confirmDeleteCategoryBtn) {
        confirmDeleteCategoryBtn.addEventListener('click', performDeleteCategory);
    }
    
    if (confirmDeleteQuestionBtn) {
        confirmDeleteQuestionBtn.addEventListener('click', performDeleteQuestion);
    }
    
    // Close delete modals when clicking outside
    [deleteCategoryModal, deleteQuestionModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    if (modal === deleteCategoryModal) closeDeleteCategoryModal();
                    if (modal === deleteQuestionModal) closeDeleteQuestionModal();
                }
            });
        }
    });
    
    // Show FAQ Management
    function showFAQManagement() {
        dashboardCards.style.display = 'none';
        logsSection.style.display = 'none';
        faqManagementSection.style.display = 'block';
        
        // Load FAQ data
        loadFAQManagementData();
    }
    
    // Return to Dashboard from FAQ Management
    function returnToDashboard() {
        faqManagementSection.style.display = 'none';
        dashboardCards.style.display = 'grid';
        logsSection.style.display = 'block';
        
        // Add entrance animation
        dashboardContainer.style.opacity = '0';
        dashboardContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            dashboardContainer.style.transition = 'all 0.5s ease';
            dashboardContainer.style.opacity = '1';
            dashboardContainer.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Switch FAQ Tab
    function switchFAQTab(tab) {
        // Update tab buttons
        faqTabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        // Show/hide tab content
        categoriesTab.style.display = tab === 'categories' ? 'block' : 'none';
        questionsTab.style.display = tab === 'questions' ? 'block' : 'none';
        
        // Load data for the active tab
        if (tab === 'categories') {
            loadCategories();
        } else if (tab === 'questions') {
            loadQuestions();
        }
    }
    
    // Load FAQ Management Data
    function loadFAQManagementData() {
        loadCategories();
        loadQuestions();
    }
    
    // Load Categories
    function loadCategories() {
        showCategoriesLoading();
        
        const url = `${GOOGLE_SCRIPT_URL}?action=readCategories`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                hideCategoriesLoading();
                if (data.success && data.values) {
                    faqCategories = data.values;
                    filteredCategories = [...faqCategories]; // Initialize filtered categories
                    renderCategories();
                    updateCategorySelects();
                    updateCategoriesSearchResults();
                    
                    // Update question counts after categories are loaded
                    updateQuestionCounts();
                } else {
                    faqCategories = [];
                    filteredCategories = [];
                    showCategoriesEmpty();
                }
            })
            .catch(error => {
                console.error('Error loading categories:', error);
                hideCategoriesLoading();
                faqCategories = [];
                filteredCategories = [];
                showCategoriesEmpty();
            });
    }
    
    // Load Questions
    function loadQuestions() {
        showQuestionsLoading();
        
        const url = `${GOOGLE_SCRIPT_URL}?action=readFAQs`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                hideQuestionsLoading();
                if (data.success && data.values) {
                    faqQuestions = data.values;
                    filteredQuestions = [...faqQuestions]; // Initialize filtered questions
                    renderQuestions();
                    
                    // Update question counts after questions are loaded
                    updateQuestionCounts();
                } else {
                    faqQuestions = [];
                    filteredQuestions = [];
                    showQuestionsEmpty();
                }
            })
            .catch(error => {
                console.error('Error loading questions:', error);
                hideQuestionsLoading();
                faqQuestions = [];
                filteredQuestions = [];
                showQuestionsEmpty();
            });
    }
    
    // Update question counts for all categories
    function updateQuestionCounts() {
        // Only update if both categories and questions are loaded
        if (faqCategories.length === 0 || faqQuestions.length === 0) {
            return;
        }
        
        // Update all category elements with correct question counts
        const categoryElements = document.querySelectorAll('.category-item');
        categoryElements.forEach(categoryElement => {
            const categoryId = categoryElement.querySelector('.edit-category-btn').dataset.categoryId;
            const questionCount = faqQuestions.filter(q => q.categorie === categoryId).length;
            const badge = categoryElement.querySelector('.question-count-badge');
            if (badge) {
                badge.innerHTML = `<i class="fas fa-question-circle"></i> ${questionCount}`;
            }
            });
    }
    
    // Render Categories
    function renderCategories() {
        if (filteredCategories.length === 0) {
            if (faqCategories.length === 0) {
                showCategoriesEmpty();
            } else {
                // Show "no results" message when search yields no results
                categoriesList.innerHTML = `
                    <div class="no-search-results">
                        <i class="fas fa-search"></i>
                        <p>Aucune catégorie ne correspond à votre recherche</p>
                    </div>
                `;
                categoriesList.style.display = 'block';
                categoriesEmpty.style.display = 'none';
            }
            return;
        }
        
        categoriesList.innerHTML = '';
        
        filteredCategories.forEach(category => {
            const categoryElement = createCategoryElement(category);
            categoriesList.appendChild(categoryElement);
        });
        
        categoriesList.style.display = 'block';
        categoriesEmpty.style.display = 'none';
    }
    
    // Create Category Element
    function createCategoryElement(category) {
        const element = document.createElement('div');
        element.className = 'category-item';
        const emoji = category.emoji || '❓';
        // Calcul du nombre de questions liées à cette catégorie
        const questionCount = faqQuestions.filter(q => q.categorie === category.id).length;
        
        element.innerHTML = `
            <div class="category-header">
                <div class="category-info">
                    <div class="category-name">
                        <span class="category-emoji">${emoji}</span>
                        ${escapeHtml(category.nom)}
                        <span class="question-count-badge" title="Questions liées">
                            <i class="fas fa-question-circle"></i> ${questionCount}
                        </span>
                    </div>
                    ${category.description ? `<div class="category-description">${escapeHtml(category.description)}</div>` : ''}
                    <div class="category-meta">
                        <span>Créé le: ${formatDate(category.cree_le)}</span>
                        ${category.modifie_le ? `<span>Modifié le: ${formatDate(category.modifie_le)}</span>` : ''}
                        <span class="visibility-status ${category.visible ? 'visible' : 'hidden'}">
                            ${category.visible ? 'Visible' : 'Masqué'}
                        </span>
                    </div>
                </div>
                <div class="category-actions">
                    <button class="category-action-btn edit-category-btn" data-category-id="${category.id}" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="category-action-btn toggle-visibility-btn ${category.visible ? 'visible' : ''}" data-category-id="${category.id}" title="${category.visible ? 'Masquer' : 'Afficher'}">
                        <i class="fas fa-eye${category.visible ? '' : '-slash'}"></i>
                    </button>
                    <button class="category-action-btn delete-category-btn" data-category-id="${category.id}" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const editBtn = element.querySelector('.edit-category-btn');
        const toggleBtn = element.querySelector('.toggle-visibility-btn');
        const deleteBtn = element.querySelector('.delete-category-btn');
        
        editBtn.addEventListener('click', () => editCategory(category.id));
        toggleBtn.addEventListener('click', () => toggleCategoryVisibility(category.id));
        deleteBtn.addEventListener('click', () => deleteCategory(category.id));
        
        return element;
    }
    
    // Update Category Selects
    function updateCategorySelects() {
        const selects = [questionCategoryFilter, document.getElementById('questionCategory')];
        
        selects.forEach(select => {
            if (!select) return;
            
            // Keep the first option
            const firstOption = select.querySelector('option');
            select.innerHTML = '';
            if (firstOption) select.appendChild(firstOption);
            
            // Add categories
            faqCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.nom;
                select.appendChild(option);
            });
        });
    }
    
    // Category Modal Functions
    function openCategoryModal(categoryId = null) {
        currentEditingCategory = categoryId;
        
        if (categoryId) {
            const category = faqCategories.find(c => c.id === categoryId);
            if (category) {
                document.getElementById('categoryModalTitle').textContent = '📁 Modifier la Catégorie';
                document.getElementById('categoryName').value = category.nom;
                document.getElementById('categoryDescription').value = category.description || '';
                document.getElementById('categoryVisible').checked = category.visible;
                
                // Set emoji
                const emoji = category.emoji || '❓';
                document.getElementById('selectedEmoji').textContent = emoji;
                document.getElementById('categoryEmoji').value = emoji;
            }
        } else {
            document.getElementById('categoryModalTitle').textContent = '📁 Nouvelle Catégorie';
            categoryForm.reset();
            document.getElementById('categoryVisible').checked = true;
            
            // Reset emoji to default
            document.getElementById('selectedEmoji').textContent = '❓';
            document.getElementById('categoryEmoji').value = '❓';
        }
        
        categoryModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    function closeCategoryModal() {
        categoryModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentEditingCategory = null;
        categoryForm.reset();
    }
    
    function saveCategory() {
        const formData = new FormData(categoryForm);
        const categoryData = {
            nom: formData.get('categoryName'),
            description: formData.get('categoryDescription') || '',
            emoji: formData.get('categoryEmoji') || '❓',
            visible: formData.get('categoryVisible') === 'on'
        };
        
        if (!categoryData.nom.trim()) {
            showErrorToast('Le nom de la catégorie est requis');
            return;
        }
        
        const action = currentEditingCategory ? 'updateCategory' : 'addCategory';
        const url = `${GOOGLE_SCRIPT_URL}?action=${action}${currentEditingCategory ? `&id=${currentEditingCategory}` : ''}&nom=${encodeURIComponent(categoryData.nom)}&description=${encodeURIComponent(categoryData.description)}&emoji=${encodeURIComponent(categoryData.emoji)}&visible=${categoryData.visible}`;
        
        saveCategoryBtn.disabled = true;
        saveCategoryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccessToast(currentEditingCategory ? 'Catégorie modifiée avec succès' : 'Catégorie créée avec succès');
                    closeCategoryModal();
                    loadCategories();
                    loadFAQStats(); // Reload FAQ stats
                    // Add log for category action
                    const action = `Catégorie ${currentEditingCategory ? 'modifiée' : 'créée'}: ${categoryData.nom}`;
                    sendLogWithIP(action);
                } else {
                    showErrorToast('Erreur lors de l\'enregistrement: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error saving category:', error);
                showErrorToast('Erreur de connexion');
            })
            .finally(() => {
                saveCategoryBtn.disabled = false;
                saveCategoryBtn.innerHTML = '<i class="fas fa-save"></i> Enregistrer';
            });
    }
    
    // Category Action Functions
    function editCategory(categoryId) {
        openCategoryModal(categoryId);
    }
    
    function toggleCategoryVisibility(categoryId) {
        const category = faqCategories.find(c => c.id === categoryId);
        if (!category) return;
        
        const newVisibility = !category.visible;
        const url = `${GOOGLE_SCRIPT_URL}?action=updateCategory&id=${categoryId}&visible=${newVisibility}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccessToast(`Catégorie ${newVisibility ? 'affichée' : 'masquée'}`);
                    loadCategories();
                    // Add log for visibility toggle
                    const action = `Catégorie ${newVisibility ? 'affichée' : 'masquée'}: ${category.nom}`;
                    sendLogWithIP(action);
                } else {
                    showErrorToast('Erreur lors de la modification');
                }
            })
            .catch(error => {
                console.error('Error toggling category visibility:', error);
                showErrorToast('Erreur de connexion');
            });
    }
    
    function deleteCategory(categoryId) {
        const category = faqCategories.find(c => c.id === categoryId);
        if (!category) return;
        
        // Store category to delete and show confirmation modal
        categoryToDelete = category;
        
        // Update modal content
        deleteCategoryName.textContent = category.nom;
        const questionCount = faqQuestions.filter(q => q.categorie === categoryId).length;
        deleteCategoryQuestionCount.textContent = questionCount;
        
        // Update the warning message based on question count
        const warningMessage = document.querySelector('.delete-message');
        if (questionCount > 0) {
            warningMessage.innerHTML = `Êtes-vous sûr de vouloir supprimer la catégorie <strong>${category.nom}</strong> ?<br><br><span style="color: #dc2626; font-weight: 600;">⚠️ Attention : ${questionCount} question${questionCount > 1 ? 's' : ''} seront également supprimée${questionCount > 1 ? 's' : ''} !</span>`;
                    } else {
            warningMessage.innerHTML = `Êtes-vous sûr de vouloir supprimer la catégorie <strong>${category.nom}</strong> ?`;
        }
        
        // Show modal
        deleteCategoryModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Loading and Empty States for Categories
    function showCategoriesLoading() {
        categoriesLoading.style.display = 'block';
        categoriesList.style.display = 'none';
        categoriesEmpty.style.display = 'none';
    }
    
    function hideCategoriesLoading() {
        categoriesLoading.style.display = 'none';
    }
    
    function showCategoriesEmpty() {
        categoriesList.style.display = 'none';
        categoriesEmpty.style.display = 'block';
    }
    
    // Similar functions for Questions would be added here...
    // For brevity, I'll add a basic structure
    
    function showQuestionsLoading() {
        questionsLoading.style.display = 'block';
        questionsList.style.display = 'none';
        questionsEmpty.style.display = 'none';
    }
    
    function hideQuestionsLoading() {
        questionsLoading.style.display = 'none';
    }
    
    function showQuestionsEmpty() {
        questionsList.style.display = 'none';
        questionsEmpty.style.display = 'block';
    }
    
    function renderQuestions() {
        hideQuestionsLoading();
        
        if (faqQuestions.length === 0) {
            showQuestionsEmpty();
            return;
        }
        
        // Apply filters: category filter first, then search filter
        filteredQuestions = [...faqQuestions];
        
        // Filter by category if needed
        if (currentQuestionCategoryFilter !== 'all') {
            filteredQuestions = filteredQuestions.filter(q => q.categorie === currentQuestionCategoryFilter);
        }
        
        // Filter by search term if needed
        if (currentQuestionsSearchTerm && currentQuestionsSearchTerm.trim() !== '') {
            const searchTerm = currentQuestionsSearchTerm.toLowerCase();
            filteredQuestions = filteredQuestions.filter(question => {
                return question.question.toLowerCase().includes(searchTerm) ||
                       question.reponse.toLowerCase().includes(searchTerm) ||
                       question.id.toString().toLowerCase().includes(searchTerm);
            });
        }
        
        if (filteredQuestions.length === 0) {
            // Show "no results" message when filters yield no results
            questionsList.innerHTML = `
                <div class="no-search-results">
                    <i class="fas fa-search"></i>
                    <p>Aucune question ne correspond à vos critères de recherche</p>
                </div>
            `;
            questionsList.style.display = 'block';
            questionsEmpty.style.display = 'none';
            return;
        }
        
        questionsList.innerHTML = '';
        
        filteredQuestions.forEach(question => {
            const questionElement = createQuestionElement(question);
            questionsList.appendChild(questionElement);
        });
        
        questionsList.style.display = 'block';
        questionsEmpty.style.display = 'none';
        updateQuestionsSearchResults();
    }
    
    // Create Question Element
    function createQuestionElement(question) {
        // Find category name
        const category = faqCategories.find(c => c.id === question.categorie);
        const categoryName = category ? category.nom : 'Catégorie inconnue';
        const categoryEmoji = category ? (category.emoji || '📁') : '📁';
        
        const element = document.createElement('div');
        element.className = 'question-item';
        element.innerHTML = `
            <div class="question-header">
                <div class="question-info">
                    <div class="question-text">${escapeHtml(question.question)}</div>
                    <div class="question-answer">${escapeHtml(question.reponse.substring(0, 150))}${question.reponse.length > 150 ? '...' : ''}</div>
                    <div class="question-meta">
                        <span class="category-badge">
                            <span class="category-emoji">${categoryEmoji}</span>
                            ${escapeHtml(categoryName)}
                        </span>
                        <span>Créé le: ${formatDate(question.cree_le)}</span>
                        ${question.modifie_le ? `<span>Modifié le: ${formatDate(question.modifie_le)}</span>` : ''}
                        <span class="visibility-status ${question.visible ? 'visible' : 'hidden'}">
                            ${question.visible ? 'Visible' : 'Masqué'}
                        </span>
                    </div>
                </div>
                <div class="question-actions">
                    <button class="question-action-btn edit-question-btn" data-question-id="${question.id}" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="question-action-btn toggle-visibility-btn ${question.visible ? 'visible' : ''}" data-question-id="${question.id}" title="${question.visible ? 'Masquer' : 'Afficher'}">
                        <i class="fas fa-eye${question.visible ? '' : '-slash'}"></i>
                    </button>
                    <button class="question-action-btn delete-question-btn" data-question-id="${question.id}" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const editBtn = element.querySelector('.edit-question-btn');
        const toggleBtn = element.querySelector('.toggle-visibility-btn');
        const deleteBtn = element.querySelector('.delete-question-btn');
        
        editBtn.addEventListener('click', () => editQuestion(question.id));
        toggleBtn.addEventListener('click', () => toggleQuestionVisibility(question.id));
        deleteBtn.addEventListener('click', () => deleteQuestion(question.id));
        
        return element;
    }
    
    function openQuestionModal(questionId = null) {
        currentEditingQuestion = questionId;
        
        if (questionId) {
            const question = faqQuestions.find(q => q.id === questionId);
            if (question) {
                document.getElementById('questionModalTitle').textContent = '❓ Modifier la Question';
                document.getElementById('questionCategory').value = question.categorie;
                document.getElementById('questionText').value = question.question;
                document.getElementById('questionAnswer').value = question.reponse;
                document.getElementById('questionVisible').checked = question.visible;
            }
        } else {
            document.getElementById('questionModalTitle').textContent = '❓ Nouvelle Question';
            questionForm.reset();
            document.getElementById('questionVisible').checked = true;
        }
        
        questionModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    function closeQuestionModal() {
        questionModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentEditingQuestion = null;
        questionForm.reset();
    }
    
    function saveQuestion() {
        const formData = new FormData(questionForm);
        const questionData = {
            categorie: formData.get('questionCategory'),
            question: formData.get('questionText'),
            reponse: formData.get('questionAnswer'),
            visible: formData.get('questionVisible') === 'on'
        };
        
        // Validation
        if (!questionData.categorie) {
            showErrorToast('Veuillez sélectionner une catégorie');
            return;
        }
        
        if (!questionData.question.trim()) {
            showErrorToast('La question est requise');
            return;
        }
        
        if (!questionData.reponse.trim()) {
            showErrorToast('La réponse est requise');
            return;
        }
        
        const action = currentEditingQuestion ? 'updateFAQ' : 'addFAQ';
        const url = `${GOOGLE_SCRIPT_URL}?action=${action}${currentEditingQuestion ? `&id=${currentEditingQuestion}` : ''}&categorie=${encodeURIComponent(questionData.categorie)}&question=${encodeURIComponent(questionData.question)}&reponse=${encodeURIComponent(questionData.reponse)}&visible=${questionData.visible}`;
        
        saveQuestionBtn.disabled = true;
        saveQuestionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccessToast(currentEditingQuestion ? 'Question modifiée avec succès' : 'Question créée avec succès');
                    closeQuestionModal();
                    loadQuestions();
                    loadFAQStats(); // Reload FAQ stats
                    
                    // Update question counts after a short delay
                    setTimeout(() => {
                        updateQuestionCounts();
                    }, 500);
                    
                    // Add log for question action
                    const logAction = `Question ${currentEditingQuestion ? 'modifiée' : 'créée'}: ${questionData.question.substring(0, 50)}${questionData.question.length > 50 ? '...' : ''}`;
                    sendLogWithIP(logAction);
                } else {
                    showErrorToast('Erreur lors de l\'enregistrement: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error saving question:', error);
                showErrorToast('Erreur de connexion');
            })
            .finally(() => {
                saveQuestionBtn.disabled = false;
                saveQuestionBtn.innerHTML = '<i class="fas fa-save"></i> Enregistrer';
            });
    }
    
    // Question Action Functions
    function editQuestion(questionId) {
        openQuestionModal(questionId);
    }
    
    function toggleQuestionVisibility(questionId) {
        const question = faqQuestions.find(q => q.id === questionId);
        if (!question) return;
        
        const newVisibility = !question.visible;
        const url = `${GOOGLE_SCRIPT_URL}?action=updateFAQ&id=${questionId}&visible=${newVisibility}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccessToast(`Question ${newVisibility ? 'affichée' : 'masquée'}`);
                    loadQuestions();
                    
                    // Update question counts after a short delay
                    setTimeout(() => {
                        updateQuestionCounts();
                    }, 500);
                    
                    // Add log for visibility toggle
                    const logAction = `Question ${newVisibility ? 'affichée' : 'masquée'}: ${question.question.substring(0, 50)}${question.question.length > 50 ? '...' : ''}`;
                    sendLogWithIP(logAction);
                } else {
                    showErrorToast('Erreur lors de la modification');
                }
            })
            .catch(error => {
                console.error('Error toggling question visibility:', error);
                showErrorToast('Erreur de connexion');
            });
    }
    
    function deleteQuestion(questionId) {
        const question = faqQuestions.find(q => q.id === questionId);
        if (!question) return;
        
        // Store question to delete and show confirmation modal
        questionToDelete = question;
        
        // Update modal content
        deleteQuestionText.textContent = question.question;
        
        // Show modal
        deleteQuestionModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Delete modal functions
    function closeDeleteQuestionModal() {
        deleteQuestionModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        questionToDelete = null;
    }
    
    function performDeleteQuestion() {
        if (!questionToDelete) return;
        
        const questionId = questionToDelete.id;
        const questionText = questionToDelete.question;
        
        // Show loading state
        confirmDeleteQuestionBtn.disabled = true;
        confirmDeleteQuestionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Suppression...';
        
            const url = `${GOOGLE_SCRIPT_URL}?action=deleteFAQ&id=${questionId}`;
            
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showSuccessToast('Question supprimée avec succès');
                    closeDeleteQuestionModal();
                        loadQuestions();
                    loadFAQStats(); // Reload FAQ stats
                    
                    // Update question counts after a short delay
                    setTimeout(() => {
                        updateQuestionCounts();
                    }, 500);
                    
                        // Add log for question deletion
                    const logAction = `Question supprimée: ${questionText.substring(0, 50)}${questionText.length > 50 ? '...' : ''}`;
                        sendLogWithIP(logAction);
                    } else {
                        showErrorToast('Erreur lors de la suppression');
                    }
                })
                .catch(error => {
                    console.error('Error deleting question:', error);
                    showErrorToast('Erreur de connexion');
            })
            .finally(() => {
                // Reset button state
                confirmDeleteQuestionBtn.disabled = false;
                confirmDeleteQuestionBtn.innerHTML = '<i class="fas fa-trash"></i> Supprimer définitivement';
                });
    }
    
    // Helper function to send logs with IP
    function sendLogWithIP(action) {
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                const userIP = data.ip || 'N/A';
                return sendLog(action, userIP);
            })
            .catch(error => {
                console.log('Could not get IP, using fallback');
                return sendLog(action, 'N/A');
            });
    }
    
    // Utility Functions
    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('fr-FR');
        } catch (error) {
            return dateStr;
        }
    }
    
    // ===== EMOJI SELECTOR FUNCTIONALITY =====
    
    // Emoji database organized by categories
    const emojiDatabase = {
        smileys: [
            '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
            '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
            '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒',
            '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'
        ],
        people: [
            '👶', '🧒', '👦', '👧', '🧑', '👨', '👩', '🧓', '👴', '👵', '👱', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱', '👨‍🦲',
            '👩‍🦲', '👨‍🦳', '👩‍🦳', '🧔', '👮', '👷', '💂', '🕵️', '👩‍⚕️', '👨‍⚕️', '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳', '👩‍🎓', '👨‍🎓',
            '👩‍🎤', '👨‍🎤', '👩‍🏫', '👨‍🏫', '👩‍🏭', '👨‍🏭', '👩‍💻', '👨‍💻', '👩‍💼', '👨‍💼', '👩‍🔧', '👨‍🔧', '👩‍🔬', '👨‍🔬', '👩‍🎨', '👨‍🎨',
            '👩‍🚒', '👨‍🚒', '👩‍✈️', '👨‍✈️', '👩‍🚀', '👨‍🚀', '👩‍⚖️', '👨‍⚖️', '👰', '🤵', '👸', '🤴', '🥷', '🦸', '🦹', '🧙',
            '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '💆', '💇', '🚶', '🧍', '🧎', '🧑‍🦽', '🧑‍🦼', '🏃', '💃', '🕺'
        ],
        nature: [
            '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵',
            '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗',
            '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎',
            '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅',
            '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖',
            '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢',
            '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔', '🌵', '🎄', '🌲', '🌳',
            '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🐚', '🌾', '💐', '🌷', '🌹',
            '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒',
            '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '🪐', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌪️',
            '🌈', '☀️', '🌤️', '⛅', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦',
            '☔', '☂️', '🌊', '🌫️'
        ],
        food: [
            '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥',
            '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠',
            '🥐', '🥖', '🍞', '🥨', '🥯', '🍳', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟',
            '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣',
            '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧',
            '🧁', '🎂', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼',
            '☕', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾'
        ],
        activities: [
            '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍',
            '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️',
            '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵',
            '🎖️', '🏆', '🏅', '🥇', '🥈', '🥉', '🎗️', '��', '🎟️', '🎪', '🤹', '🎭', '🩰', '🎨', '🎬', '🎤',
            '🎧', '🎼', '🎵', '🎶', '🥾', '🎯', '🎲', '🎰', '🎳', '🎮', '🕹️', '🎸', '🥁', '🎺', '🎷', '🎻',
            '🪕', '🎹', '🪗', '🪘', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶'
        ],
        travel: [
            '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵',
            '🚲', '🛴', '🛹', '🛼', '🚁', '🛸', '✈️', '🛩️', '🪂', '💺', '🚀', '🛰️', '🚢', '⛵', '🚤', '🛥️',
            '🛳️', '⛴️', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍',
            '🚘', '🚖', '🚡', '🚠', '🚟', '🎢', '🎡', '🎠', '🏗️', '🌉', '🗼', '🗽', '⛪', '🕌', '🛕', '🕍',
            '⛩️', '🕋', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🏠', '🏡', '🏘️',
            '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪',
            '🕌', '🕍', '🛕', '🕋', '⛩️', '🗾', '🎑', '🏞️', '🌅', '🌄', '🌠', '🎇', '🎆', '🌇', '🌆', '🏙️',
            '🌃', '🌌', '🌉', '🌁', '🆓', '🆕', '🆖', '🆗', '🆘', '🆙', '🆚', '🈁', '🈂️', '🈷️', '🈶', '🈯',
            '🉐', '🈹', '🈚', '🈲', '🉑', '🈸', '🈴', '🈳', '㊗️', '㊙️', '🈺', '🈵'
        ],
        objects: [
            '💎', '🔔', '🔕', '🎼', '🎵', '🎶', '🎙️', '🎚️', '🎛️', '🎤', '🎧', '📻', '🎷', '🪗', '🎸', '🎹',
            '🎺', '🎻', '🪕', '🥁', '🪘', '📱', '📞', '📟', '📠', '🔋', '🔌', '💻', '🖥️', '🖨️', '⌨️', '🖱️',
            '🖲️', '💽', '💾', '💿', '📀', '🧮', '🎥', '🎞️', '📽️', '🎬', '📺', '📷', '📸', '📹', '📼', '🔍',
            '🔎', '🕯️', '💡', '🔦', '🏮', '🪔', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃',
            '📜', '📄', '📰', '🗞️', '📑', '🔖', '🏷️', '💰', '🪙', '💴', '💵', '💶', '💷', '💸', '💳', '🧾',
            '💹', '✉️', '📧', '📨', '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🗳️', '✏️', '✒️',
            '🖋️', '🖊️', '🖌️', '🖍️', '📝', '💼', '📁', '📂', '🗂️', '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉',
            '📊', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗃️', '🗄️', '🗑️', '🔒', '🔓', '🔏', '🔐',
            '🔑', '🗝️', '🔨', '🪓', '⛏️', '⚒️', '🛠️', '🗡️', '⚔️', '🔫', '🪃', '🏹', '🛡️', '🪚', '🔧', '🪛',
            '🔩', '⚙️', '🗜️', '⚖️', '🦯', '🔗', '⛓️', '🪝', '🧰', '🧲', '🪜', '⚗️', '🧪', '🧫', '🧬', '🔬',
            '🔭', '📡', '💉', '🩸', '💊', '🩹', '🩺', '🚪', '🪞', '🪟', '🛏️', '🛋️', '🪑', '🚽', '🪠', '🚿',
            '🛁', '🪤', '🪒', '🧴', '🧷', '🧹', '🧺', '🧻', '🪣', '🧼', '🪥', '🧽', '🧯', '🛒', '🚬', '⚰️',
            '🪦', '⚱️', '🗿', '🪧', '🪪'
        ],
        symbols: [
            '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
            '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈',
            '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',
            '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️',
            '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯',
            '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸',
            '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧',
            '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶',
            '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣',
            '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️',
            '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️',
            '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕',
            '➖', '➗', '✖️', '♾️', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜',
            '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹',
            '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪',
            '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '💬', '💭', '🗯️', '♠️', '♣️',
            '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚',
            '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧'
        ],
        flags: [
            '🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇫', '🇦🇽', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶',
            '🇦🇬', '🇦🇷', '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹', '🇦🇿', '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾', '🇧🇪', '🇧🇿', '🇧🇯', '🇧🇲',
            '🇧🇹', '🇧🇴', '🇧🇦', '🇧🇼', '🇧🇷', '🇮🇴', '🇻🇬', '🇧🇳', '🇧🇬', '🇧🇫', '🇧🇮', '🇰🇭', '🇨🇲', '🇨🇦', '🇮🇨', '🇨🇻',
            '🇧🇶', '🇰🇾', '🇨🇫', '🇹🇩', '🇨🇱', '🇨🇳', '🇨🇽', '🇨🇨', '🇨🇴', '🇰🇲', '🇨🇬', '🇨🇩', '🇨🇰', '🇨🇷', '🇨🇮', '🇭🇷',
            '🇨🇺', '🇨🇼', '🇨🇾', '🇨🇿', '🇩🇰', '🇩🇯', '🇩🇲', '🇩🇴', '🇪🇨', '🇪🇬', '🇸🇻', '🇬🇶', '🇪🇷', '🇪🇪', '🇪🇹', '🇪🇺',
            '🇫🇰', '🇫🇴', '🇫🇯', '🇫🇮', '🇫🇷', '🇬🇫', '🇵🇫', '🇹🇫', '🇬🇦', '🇬🇲', '🇬🇪', '🇩🇪', '🇬🇭', '🇬🇮', '🇬🇷', '🇬🇱',
            '🇬🇩', '🇬🇵', '🇬🇺', '🇬🇹', '🇬🇬', '🇬🇳', '🇬🇼', '🇬🇾', '🇭🇹', '🇭🇳', '🇭🇰', '🇭🇺', '🇮🇸', '🇮🇳', '🇮🇩', '🇮🇷',
            '🇮🇶', '🇮🇪', '🇮🇲', '🇮🇱', '🇮🇹', '🇯🇲', '🇯🇵', '🎌', '🇯🇪', '🇯🇴', '🇰🇿', '🇰🇪', '🇰🇮', '🇽🇰', '🇰🇼', '🇰🇬',
            '🇱🇦', '🇱🇻', '🇱🇧', '🇱🇸', '🇱🇷', '🇱🇾', '🇱🇮', '🇱🇹', '🇱🇺', '🇲🇴', '🇲🇰', '🇲🇬', '🇲🇼', '🇲🇾', '🇲🇻', '🇲🇱',
            '🇲🇹', '🇲🇭', '🇲🇶', '🇲🇷', '🇲🇺', '🇾🇹', '🇲🇽', '🇫🇲', '🇲🇩', '🇲🇨', '🇲🇳', '🇲🇪', '🇲🇸', '🇲🇦', '🇲🇿', '🇲🇲',
            '🇳🇦', '🇳🇷', '🇳🇵', '🇳🇱', '🇳🇨', '🇳🇿', '🇳🇮', '🇳🇪', '🇳🇬', '🇳🇺', '🇳🇫', '🇰🇵', '🇲🇵', '🇳🇴', '🇴🇲', '🇵🇰',
            '🇵🇼', '🇵🇸', '🇵🇦', '🇵🇬', '🇵🇾', '🇵🇪', '🇵🇭', '🇵🇳', '🇵🇱', '🇵🇹', '🇵🇷', '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇺', '🇷🇼',
            '🇼🇸', '🇸🇲', '🇸🇹', '🇸🇦', '🇸🇳', '🇷🇸', '🇸🇨', '🇸🇱', '🇸🇬', '🇸🇽', '🇸🇰', '🇸🇮', '🇬🇸', '🇸🇧', '🇸🇴', '🇿🇦',
            '🇰🇷', '🇸🇸', '🇪🇸', '🇱🇰', '🇧🇱', '🇸🇭', '🇰🇳', '🇱🇨', '🇵🇲', '🇻🇨', '🇸🇩', '🇸🇷', '🇸🇿', '🇸🇪', '🇨🇭', '🇸🇾',
            '🇹🇼', '🇹🇯', '🇹🇿', '🇹🇭', '🇹🇱', '🇹🇬', '🇹🇰', '🇹🇴', '🇹🇹', '🇹🇳', '🇹🇷', '🇹🇲', '🇹🇨', '🇹🇻', '🇻🇮', '🇺🇬',
            '🇺🇦', '🇦🇪', '🇬🇧', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🏴󠁧󠁢󠁷󠁬󠁳󠁿', '🇺🇸', '🇺🇾', '🇺🇿', '🇻🇺', '🇻🇦', '🇻🇪', '🇻🇳', '🇼🇫', '🇪🇭', '🇾🇪',
            '🇿🇲', '🇿🇼'
        ]
    };
    
    // Emoji selector elements
    const emojiDisplay = document.getElementById('emojiDisplay');
    const selectedEmoji = document.getElementById('selectedEmoji');
    const emojiPicker = document.getElementById('emojiPicker');
    const emojiSearch = document.getElementById('emojiSearch');
    const emojiGrid = document.getElementById('emojiGrid');
    const emojiCategoryBtns = document.querySelectorAll('.emoji-cat-btn');
    
    let currentEmojiCategory = 'smileys';
    let isEmojiPickerOpen = false;
    
    // Initialize emoji selector
    if (emojiDisplay) {
        emojiDisplay.addEventListener('click', toggleEmojiPicker);
        loadEmojiCategory(currentEmojiCategory);
        
        // Handle emoji category buttons
        emojiCategoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = btn.dataset.category;
                switchEmojiCategory(category);
            });
        });
        
        // Handle emoji search
        if (emojiSearch) {
            emojiSearch.addEventListener('input', handleEmojiSearch);
        }
        
        // Close emoji picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!emojiPicker.contains(e.target) && !emojiDisplay.contains(e.target)) {
                closeEmojiPicker();
            }
        });
    }
    
    function toggleEmojiPicker() {
        if (isEmojiPickerOpen) {
            closeEmojiPicker();
        } else {
            openEmojiPicker();
        }
    }
    
    function openEmojiPicker() {
        emojiPicker.style.display = 'block';
        isEmojiPickerOpen = true;
        loadEmojiCategory(currentEmojiCategory);
    }
    
    function closeEmojiPicker() {
        emojiPicker.style.display = 'none';
        isEmojiPickerOpen = false;
    }
    
    function switchEmojiCategory(category) {
        currentEmojiCategory = category;
        
        // Update active category button
        emojiCategoryBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        // Clear search
        emojiSearch.value = '';
        
        // Load category emojis
        loadEmojiCategory(category);
    }
    
    function loadEmojiCategory(category) {
        const emojis = emojiDatabase[category] || [];
        renderEmojis(emojis);
    }
    
    function renderEmojis(emojis) {
        emojiGrid.innerHTML = '';
        
        emojis.forEach(emoji => {
            const emojiItem = document.createElement('div');
            emojiItem.className = 'emoji-item';
            emojiItem.textContent = emoji;
            emojiItem.addEventListener('click', () => selectEmoji(emoji));
            emojiGrid.appendChild(emojiItem);
        });
    }
    
    function selectEmoji(emoji) {
        selectedEmoji.textContent = emoji;
        document.getElementById('categoryEmoji').value = emoji;
        closeEmojiPicker();
    }
    
    function handleEmojiSearch() {
        const searchTerm = emojiSearch.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            loadEmojiCategory(currentEmojiCategory);
            return;
        }
        
        // Search through all emojis
        const allEmojis = Object.values(emojiDatabase).flat();
        const filteredEmojis = allEmojis.filter(emoji => {
            // Simple search - could be enhanced with emoji names/keywords
            return true; // For now, show all when searching
        });
        
        renderEmojis(filteredEmojis.slice(0, 64)); // Limit results
    }
    
    // ===== FAQ SEARCH FUNCTIONALITY =====
    
    // Reset FAQ stats placeholder
    function resetFAQStatsPlaceholder() {
        const faqCard = document.querySelector('.admin-card:nth-child(2)');
        if (faqCard) {
            const cardContent = faqCard.querySelector('.card-content');
            const existingStats = cardContent.querySelector('.faq-stats');
            const placeholder = cardContent.querySelector('#faqStatsPlaceholder');
            
            // Remove existing stats if any
            if (existingStats && !existingStats.id) {
                existingStats.remove();
            }
            
            // Reset placeholder if it exists
            if (placeholder) {
                placeholder.innerHTML = `
                    <div class="stats-container">
                        <div class="stat-item">
                            <div class="stat-loading">
                                <i class="fas fa-spinner fa-spin"></i>
                            </div>
                            <span class="stat-label">Catégories</span>
                        </div>
                        <div class="stat-item">
                            <div class="stat-loading">
                                <i class="fas fa-spinner fa-spin"></i>
                            </div>
                            <span class="stat-label">Questions</span>
                        </div>
                    </div>
                `;
                placeholder.style.animation = 'pulse 2s ease-in-out infinite';
                placeholder.style.opacity = '0.8';
                placeholder.style.transform = 'scale(1)';
            }
        }
    }
    
    // Refresh FAQ Data
    function refreshFAQData() {
        // Show loading animation on refresh button
        const refreshBtn = document.getElementById('refreshFaqBtn');
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualisation...';
        refreshBtn.disabled = true;
        
        // Reset placeholder first
        resetFAQStatsPlaceholder();
        
        // Refresh both categories and questions
        loadCategories();
        loadQuestions();
        
        // Refresh FAQ stats
        loadFAQStats();
        
        // Update question counts after a short delay to ensure both data are loaded
        setTimeout(() => {
            updateQuestionCounts();
        }, 1000);
        
        // Reset button after 2 seconds
        setTimeout(() => {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
            showSuccessToast('📋 Données FAQ actualisées avec succès !');
        }, 2000);
    }
    
    // Handle Categories Search
    function handleCategoriesSearch() {
        const searchTerm = categoriesSearchInput.value.trim().toLowerCase();
        currentCategoriesSearchTerm = searchTerm;
        
        if (searchTerm === '') {
            filteredCategories = [...faqCategories];
            clearCategoriesSearchBtn.style.display = 'none';
        } else {
            filteredCategories = faqCategories.filter(category => {
                return category.nom.toLowerCase().includes(searchTerm) ||
                       (category.description && category.description.toLowerCase().includes(searchTerm)) ||
                       category.id.toString().toLowerCase().includes(searchTerm);
            });
            clearCategoriesSearchBtn.style.display = 'block';
        }
        
        renderCategories();
        updateCategoriesSearchResults();
    }
    
    // Clear Categories Search
    function clearCategoriesSearch() {
        categoriesSearchInput.value = '';
        currentCategoriesSearchTerm = '';
        filteredCategories = [...faqCategories];
        clearCategoriesSearchBtn.style.display = 'none';
        renderCategories();
        updateCategoriesSearchResults();
        categoriesSearchInput.focus();
    }
    
    // Update Categories Search Results
    function updateCategoriesSearchResults() {
        const searchTerm = categoriesSearchInput.value.trim();
        
        if (searchTerm && searchTerm !== '') {
            const resultCount = filteredCategories.length;
            categoriesSearchResultsText.textContent = `${resultCount} résultat${resultCount !== 1 ? 's' : ''} trouvé${resultCount !== 1 ? 's' : ''}`;
            categoriesSearchResults.style.display = 'block';
        } else {
            categoriesSearchResults.style.display = 'none';
        }
    }
    
    // Handle Questions Search
    function handleQuestionsSearch() {
        const searchTerm = questionsSearchInput.value.trim().toLowerCase();
        currentQuestionsSearchTerm = searchTerm;
        
        if (searchTerm === '') {
            clearQuestionsSearchBtn.style.display = 'none';
        } else {
            clearQuestionsSearchBtn.style.display = 'block';
        }
        
        renderQuestions(); // This will apply both search and category filter
        updateQuestionsSearchResults();
    }
    
    // Clear Questions Search
    function clearQuestionsSearch() {
        questionsSearchInput.value = '';
        currentQuestionsSearchTerm = '';
        clearQuestionsSearchBtn.style.display = 'none';
        renderQuestions();
        updateQuestionsSearchResults();
        questionsSearchInput.focus();
    }
    
    // Update Questions Search Results
    function updateQuestionsSearchResults() {
        const searchTerm = questionsSearchInput.value.trim();
        
        if (searchTerm && searchTerm !== '') {
            const resultCount = filteredQuestions.length;
            questionsSearchResultsText.textContent = `${resultCount} résultat${resultCount !== 1 ? 's' : ''} trouvé${resultCount !== 1 ? 's' : ''}`;
            questionsSearchResults.style.display = 'block';
        } else {
            questionsSearchResults.style.display = 'none';
        }
    }
    
    // Load message statistics
    function loadMessageStats() {
        const url = `${GOOGLE_SCRIPT_URL}?action=getMessageStats`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.stats) {
                    const stats = data.stats;
                    
                    // Update message card with statistics
                    const messageCard = document.querySelector('.admin-card:nth-child(1)');
                    if (messageCard) {
                        const cardContent = messageCard.querySelector('.card-content');
                        const existingStats = cardContent.querySelector('.message-stats');
                        const placeholder = cardContent.querySelector('#messageStatsPlaceholder');
                        
                        // Create stats element
                        const statsElement = document.createElement('div');
                        statsElement.className = 'message-stats';
                        statsElement.innerHTML = `
                            <div class="stats-container">
                                <div class="stat-item">
                                    <span class="stat-number">${stats.totalMessages}</span>
                                    <span class="stat-label">Messages</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number">${stats.archivedMessages}</span>
                                    <span class="stat-label">Archives</span>
                                </div>
                            </div>
                        `;
                        
                        // If placeholder exists, replace it with animation
                        if (placeholder) {
                            // Add fade out animation to placeholder
                            placeholder.style.transition = 'all 0.5s ease';
                            placeholder.style.opacity = '0';
                            placeholder.style.transform = 'scale(0.95)';
                            
                            setTimeout(() => {
                                // Replace placeholder with real stats
                                placeholder.replaceWith(statsElement);
                                
                                // Add fade in animation to new stats
                                statsElement.style.opacity = '0';
                                statsElement.style.transform = 'scale(0.95)';
                                
                                setTimeout(() => {
                                    statsElement.style.transition = 'all 0.5s ease';
                                    statsElement.style.opacity = '1';
                                    statsElement.style.transform = 'scale(1)';
                                }, 50);
                            }, 500);
                        } else {
                            // Remove existing stats if any
                            if (existingStats) {
                                existingStats.remove();
                            }
                            
                            // Insert stats before the button
                            const cardBtn = cardContent.querySelector('.card-btn');
                            if (cardBtn) {
                                cardContent.insertBefore(statsElement, cardBtn);
                            } else {
                                cardContent.appendChild(statsElement);
                            }
                            
                            // Add fade in animation
                            statsElement.style.opacity = '0';
                            statsElement.style.transform = 'scale(0.95)';
                            
                            setTimeout(() => {
                                statsElement.style.transition = 'all 0.5s ease';
                                statsElement.style.opacity = '1';
                                statsElement.style.transform = 'scale(1)';
                            }, 50);
                        }
                    }
                } else {
                    // If no data, show error state in placeholder
                    const placeholder = document.querySelector('#messageStatsPlaceholder');
                    if (placeholder) {
                        placeholder.innerHTML = `
                            <div class="stats-container">
                                <div class="stat-item">
                                    <span class="stat-number">--</span>
                                    <span class="stat-label">Messages</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number">--</span>
                                    <span class="stat-label">Archives</span>
                                </div>
                            </div>
                        `;
                        placeholder.style.animation = 'none';
                        placeholder.style.opacity = '0.6';
                    }
                }
            })
            .catch(error => {
                console.error('Error loading message stats:', error);
                
                // Show error state in placeholder
                const placeholder = document.querySelector('#messageStatsPlaceholder');
                if (placeholder) {
                    placeholder.innerHTML = `
                        <div class="stats-container">
                            <div class="stat-item">
                                <span class="stat-number">--</span>
                                <span class="stat-label">Messages</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">--</span>
                                <span class="stat-label">Archives</span>
                            </div>
                        </div>
                    `;
                    placeholder.style.animation = 'none';
                    placeholder.style.opacity = '0.6';
                }
            });
    }
    
    // Reset message stats placeholder
    function resetMessageStatsPlaceholder() {
        const messageCard = document.querySelector('.admin-card:nth-child(1)');
        if (messageCard) {
            const cardContent = messageCard.querySelector('.card-content');
            const existingStats = cardContent.querySelector('.message-stats');
            const placeholder = cardContent.querySelector('#messageStatsPlaceholder');
            
            // Remove existing stats if any
            if (existingStats && !existingStats.id) {
                existingStats.remove();
            }
            
            // Reset placeholder if it exists
            if (placeholder) {
                placeholder.innerHTML = `
                    <div class="stats-container">
                        <div class="stat-item">
                            <div class="stat-loading">
                                <i class="fas fa-spinner fa-spin"></i>
                            </div>
                            <span class="stat-label">Messages</span>
                        </div>
                        <div class="stat-item">
                            <div class="stat-loading">
                                <i class="fas fa-spinner fa-spin"></i>
                            </div>
                            <span class="stat-label">Archives</span>
                        </div>
                    </div>
                `;
                placeholder.style.animation = 'pulse 2s ease-in-out infinite';
                placeholder.style.opacity = '0.8';
                placeholder.style.transform = 'scale(1)';
            }
        }
    }
    
    // Refresh message statistics
    function refreshMessageStats() {
        resetMessageStatsPlaceholder();
        loadMessageStats();
    }
    
    // ===== GUILD MODAL FUNCTIONALITY =====
    const guildBtn = document.getElementById('guildBtn');
    const guildModal = document.getElementById('guildModal');
    const closeGuildModalBtn = document.getElementById('closeGuildModalBtn');
    const closeGuildBtn = document.getElementById('closeGuildBtn');
    const guildTabBtns = document.querySelectorAll('.guild-tab-btn');
    const inboxTutorial = document.getElementById('inboxTutorial');
    const faqTutorial = document.getElementById('faqTutorial');
    const newsTutorial = document.getElementById('newsTutorial');
    const guildTabContents = {
        inbox: inboxTutorial,
        faq: faqTutorial,
        news: newsTutorial
    };

    if (guildBtn && guildModal) {
        guildBtn.addEventListener('click', () => {
            guildModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }
    [closeGuildModalBtn, closeGuildBtn].forEach(btn => {
        if (btn) btn.addEventListener('click', closeGuildModal);
    });
    function closeGuildModal() {
        guildModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    // Tab switching
    guildTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            guildTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            Object.values(guildTabContents).forEach(tab => tab.classList.remove('active'));
            const tab = btn.dataset.tab;
            if (guildTabContents[tab]) guildTabContents[tab].classList.add('active');
        });
    });
    // Fermer le modal Guild en cliquant en dehors
    if (guildModal) {
        guildModal.addEventListener('click', function(e) {
            if (e.target === guildModal) closeGuildModal();
        });
    }
    
    // Delete modal functions
    function closeDeleteCategoryModal() {
        deleteCategoryModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        categoryToDelete = null;
        
        // Reset the warning message
        const warningMessage = document.querySelector('.delete-message');
        warningMessage.innerHTML = 'Êtes-vous sûr de vouloir supprimer la catégorie <strong id="deleteCategoryName"></strong> ?';
    }
    
    function closeDeleteQuestionModal() {
        deleteQuestionModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        questionToDelete = null;
    }
    
    function performDeleteCategory() {
        if (!categoryToDelete) return;
        
        const categoryId = categoryToDelete.id;
        const categoryName = categoryToDelete.nom;
        
        // Show loading state
        confirmDeleteCategoryBtn.disabled = true;
        confirmDeleteCategoryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Suppression...';
        
        // First, get all questions in this category
        const questionsInCategory = faqQuestions.filter(q => q.categorie === categoryId);
        
        // Create promises for deleting all questions in the category
        const deleteQuestionPromises = questionsInCategory.map(question => {
            const url = `${GOOGLE_SCRIPT_URL}?action=deleteFAQ&id=${question.id}`;
            return fetch(url).then(response => response.json());
        });
        
        // Delete all questions first, then delete the category
        Promise.all(deleteQuestionPromises)
            .then(() => {
                // Now delete the category
                const categoryUrl = `${GOOGLE_SCRIPT_URL}?action=deleteCategory&id=${categoryId}`;
                return fetch(categoryUrl).then(response => response.json());
            })
            .then(data => {
                if (data.success) {
                    const questionCount = questionsInCategory.length;
                    const message = questionCount > 0 
                        ? `Catégorie et ${questionCount} question${questionCount > 1 ? 's' : ''} supprimée${questionCount > 1 ? 's' : ''} avec succès`
                        : 'Catégorie supprimée avec succès';
                    
                    showSuccessToast(message);
                    closeDeleteCategoryModal();
                    loadCategories();
                    loadQuestions(); // Reload questions as they might be affected
                    loadFAQStats(); // Reload FAQ stats
                    
                    // Update question counts after a short delay
                    setTimeout(() => {
                        updateQuestionCounts();
                    }, 500);
                    
                    // Add log for category deletion
                    const action = `Catégorie supprimée: ${categoryName} (${questionCount} question${questionCount > 1 ? 's' : ''} supprimée${questionCount > 1 ? 's' : ''})`;
                    sendLogWithIP(action);
                } else {
                    showErrorToast('Erreur lors de la suppression de la catégorie');
                }
            })
            .catch(error => {
                console.error('Error deleting category and questions:', error);
                showErrorToast('Erreur de connexion lors de la suppression');
            })
            .finally(() => {
                // Reset button state
                confirmDeleteCategoryBtn.disabled = false;
                confirmDeleteCategoryBtn.innerHTML = '<i class="fas fa-trash"></i> Supprimer définitivement';
            });
    }
    
    // ===== NEWS MANAGEMENT FUNCTIONALITY =====
    
    // News Management Elements
    const manageNewsBtn = document.getElementById('manageNewsBtn');
    const newsManagementSection = document.getElementById('newsManagementSection');
    const backToDashboardFromNewsBtn = document.getElementById('backToDashboardFromNewsBtn');
    const refreshNewsBtn = document.getElementById('refreshNewsBtn');
    
    // News Elements
    const addArticleBtn = document.getElementById('addArticleBtn');
    const newsLoading = document.getElementById('newsLoading');
    const newsList = document.getElementById('newsList');
    const newsEmpty = document.getElementById('newsEmpty');
    
    // News Search Elements
    const newsSearchInput = document.getElementById('newsSearchInput');
    const clearNewsSearchBtn = document.getElementById('clearNewsSearchBtn');
    const newsSearchResults = document.getElementById('newsSearchResults');
    const newsSearchResultsText = document.getElementById('newsSearchResultsText');
    
    // Article Modal Elements
    const articleModal = document.getElementById('articleModal');
    const closeArticleModalBtn = document.getElementById('closeArticleModalBtn');
    const articleForm = document.getElementById('articleForm');
    const saveArticleBtn = document.getElementById('saveArticleBtn');
    const cancelArticleBtn = document.getElementById('cancelArticleBtn');
    
    // Delete Article Confirmation Modal Elements
    const deleteArticleModal = document.getElementById('deleteArticleModal');
    const closeDeleteArticleModalBtn = document.getElementById('closeDeleteArticleModalBtn');
    const cancelDeleteArticleBtn = document.getElementById('cancelDeleteArticleBtn');
    const confirmDeleteArticleBtn = document.getElementById('confirmDeleteArticleBtn');
    const deleteArticleText = document.getElementById('deleteArticleText');
    
    // Delete confirmation state
    let articleToDelete = null;
    
    // News State
    let newsArticles = [];
    let filteredArticles = [];
    let currentEditingArticle = null;
    let currentNewsSearchTerm = '';
    
    // News Event Listeners
    if (manageNewsBtn) {
        manageNewsBtn.addEventListener('click', showNewsManagement);
    }
    
    if (backToDashboardFromNewsBtn) {
        backToDashboardFromNewsBtn.addEventListener('click', returnToDashboardFromNews);
    }
    
    if (refreshNewsBtn) {
        refreshNewsBtn.addEventListener('click', refreshNewsData);
    }
    
    // Article management
    if (addArticleBtn) {
        addArticleBtn.addEventListener('click', () => openArticleModal());
    }
    
    if (saveArticleBtn) {
        saveArticleBtn.addEventListener('click', saveArticle);
    }
    
    if (cancelArticleBtn || closeArticleModalBtn) {
        [cancelArticleBtn, closeArticleModalBtn].forEach(btn => {
            if (btn) btn.addEventListener('click', closeArticleModal);
        });
    }
    
    // News search
    if (newsSearchInput) {
        newsSearchInput.addEventListener('input', handleNewsSearch);
        newsSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleNewsSearch();
            }
        });
    }
    
    if (clearNewsSearchBtn) {
        clearNewsSearchBtn.addEventListener('click', clearNewsSearch);
    }
    
    // Close modals when clicking outside
    if (articleModal) {
        articleModal.addEventListener('click', function(e) {
            if (e.target === articleModal) {
                closeArticleModal();
            }
        });
    }
    
    // Delete confirmation modal event listeners
    if (closeDeleteArticleModalBtn) {
        closeDeleteArticleModalBtn.addEventListener('click', closeDeleteArticleModal);
    }
    
    if (cancelDeleteArticleBtn) {
        cancelDeleteArticleBtn.addEventListener('click', closeDeleteArticleModal);
    }
    
    if (confirmDeleteArticleBtn) {
        confirmDeleteArticleBtn.addEventListener('click', performDeleteArticle);
    }
    
    // Close delete modal when clicking outside
    if (deleteArticleModal) {
        deleteArticleModal.addEventListener('click', function(e) {
            if (e.target === deleteArticleModal) {
                closeDeleteArticleModal();
            }
        });
    }
    
    // Show News Management
    function showNewsManagement() {
        dashboardCards.style.display = 'none';
        logsSection.style.display = 'none';
        faqManagementSection.style.display = 'none';
        newsManagementSection.style.display = 'block';
        
        // Load news data
        loadNewsManagementData();
    }
    
    // Return to Dashboard from News Management
    function returnToDashboardFromNews() {
        newsManagementSection.style.display = 'none';
        dashboardCards.style.display = 'grid';
        logsSection.style.display = 'block';
        
        // Add entrance animation
        dashboardContainer.style.opacity = '0';
        dashboardContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            dashboardContainer.style.transition = 'all 0.5s ease';
            dashboardContainer.style.opacity = '1';
            dashboardContainer.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Load News Management Data
    function loadNewsManagementData() {
        loadArticles();
    }
    
    // Load Articles
    function loadArticles() {
        showNewsLoading();
        
        const url = `${GOOGLE_SCRIPT_URL}?action=readArticles`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                hideNewsLoading();
                if (data.success && data.values) {
                    newsArticles = data.values;
                    filteredArticles = [...newsArticles]; // Initialize filtered articles
                    renderArticles();
                    updateNewsSearchResults();
                    
                    // Update news stats
                    loadNewsStats();
                } else {
                    newsArticles = [];
                    filteredArticles = [];
                    showNewsEmpty();
                }
            })
            .catch(error => {
                console.error('Error loading articles:', error);
                hideNewsLoading();
                newsArticles = [];
                filteredArticles = [];
                showNewsEmpty();
            });
    }
    
    // Render Articles
    function renderArticles() {
        if (filteredArticles.length === 0) {
            if (newsArticles.length === 0) {
                showNewsEmpty();
            } else {
                // Show "no results" message when search yields no results
                newsList.innerHTML = `
                    <div class="no-search-results">
                        <i class="fas fa-search"></i>
                        <p>Aucun article ne correspond à votre recherche</p>
                    </div>
                `;
                newsList.style.display = 'block';
                newsEmpty.style.display = 'none';
            }
            return;
        }
        
        newsList.innerHTML = '';
        
        filteredArticles.forEach(article => {
            const articleElement = createArticleElement(article);
            newsList.appendChild(articleElement);
        });
        
        newsList.style.display = 'block';
        newsEmpty.style.display = 'none';
    }
    
    // Create Article Element
    function createArticleElement(article) {
        const element = document.createElement('div');
        element.className = 'article-item';
        
        // Format content preview (first 150 characters)
        const contentPreview = article.contenu ? 
            (article.contenu.length > 150 ? article.contenu.substring(0, 150) + '...' : article.contenu) : 
            'Aucun contenu';
        
        element.innerHTML = `
            <div class="article-header">
                <div class="article-info">
                    <div class="article-title">${escapeHtml(article.titre)}</div>
                    <div class="article-content">${escapeHtml(contentPreview)}</div>
                    <div class="article-meta">
                        <span>Créé le: ${formatDate(article.cree_le)}</span>
                        ${article.modifie_le ? `<span>Modifié le: ${formatDate(article.modifie_le)}</span>` : ''}
                        ${article.image_url ? `<span><i class="fas fa-image"></i> Avec image</span>` : ''}
                        <span class="visibility-status ${article.visible ? 'visible' : 'hidden'}">
                            ${article.visible ? 'Visible' : 'Masqué'}
                        </span>
                    </div>
                </div>
                <div class="article-actions">
                    <button class="article-action-btn edit-article-btn" data-article-id="${article.id}" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="article-action-btn toggle-visibility-btn ${article.visible ? 'visible' : ''}" data-article-id="${article.id}" title="${article.visible ? 'Masquer' : 'Afficher'}">
                        <i class="fas fa-eye${article.visible ? '' : '-slash'}"></i>
                    </button>
                    <button class="article-action-btn delete-article-btn" data-article-id="${article.id}" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const editBtn = element.querySelector('.edit-article-btn');
        const toggleBtn = element.querySelector('.toggle-visibility-btn');
        const deleteBtn = element.querySelector('.delete-article-btn');
        
        editBtn.addEventListener('click', () => editArticle(article.id));
        toggleBtn.addEventListener('click', () => toggleArticleVisibility(article.id));
        deleteBtn.addEventListener('click', () => deleteArticle(article.id));
        
        return element;
    }
    
    // Article Modal Functions
    function openArticleModal(articleId = null) {
        currentEditingArticle = articleId;
        
        if (articleId) {
            const article = newsArticles.find(a => a.id === articleId);
            if (article) {
                document.getElementById('articleModalTitle').textContent = '📰 Modifier l\'Article';
                document.getElementById('articleTitle').value = article.titre;
                document.getElementById('articleContent').value = article.contenu || '';
                document.getElementById('articleImageUrl').value = article.image_url || '';
                document.getElementById('articleVisible').checked = article.visible;
            }
        } else {
            document.getElementById('articleModalTitle').textContent = '📰 Nouvel Article';
            articleForm.reset();
            document.getElementById('articleVisible').checked = true;
        }
        
        articleModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    function closeArticleModal() {
        articleModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentEditingArticle = null;
        articleForm.reset();
    }
    
    function saveArticle() {
        const formData = new FormData(articleForm);
        const articleData = {
            titre: formData.get('articleTitle'),
            contenu: formData.get('articleContent'),
            image_url: formData.get('articleImageUrl') || '',
            visible: formData.get('articleVisible') === 'on'
        };
        
        // Validation
        if (!articleData.titre.trim()) {
            showErrorToast('Le titre de l\'article est requis');
            return;
        }
        
        if (!articleData.contenu.trim()) {
            showErrorToast('Le contenu de l\'article est requis');
            return;
        }
        
        const action = currentEditingArticle ? 'updateArticle' : 'addArticle';
        const url = `${GOOGLE_SCRIPT_URL}?action=${action}${currentEditingArticle ? `&id=${currentEditingArticle}` : ''}&titre=${encodeURIComponent(articleData.titre)}&contenu=${encodeURIComponent(articleData.contenu)}&image_url=${encodeURIComponent(articleData.image_url)}&visible=${articleData.visible}`;
        
        saveArticleBtn.disabled = true;
        saveArticleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccessToast(currentEditingArticle ? 'Article modifié avec succès' : 'Article créé avec succès');
                    closeArticleModal();
                    loadArticles();
                    loadNewsStats(); // Reload news stats
                    
                    // Add log for article action
                    const logAction = `Article ${currentEditingArticle ? 'modifié' : 'créé'}: ${articleData.titre.substring(0, 50)}${articleData.titre.length > 50 ? '...' : ''}`;
                    sendLogWithIP(logAction);
                } else {
                    showErrorToast('Erreur lors de l\'enregistrement: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error saving article:', error);
                showErrorToast('Erreur de connexion');
            })
            .finally(() => {
                saveArticleBtn.disabled = false;
                saveArticleBtn.innerHTML = '<i class="fas fa-save"></i> Enregistrer';
            });
    }
    
    // Article Action Functions
    function editArticle(articleId) {
        openArticleModal(articleId);
    }
    
    function toggleArticleVisibility(articleId) {
        const article = newsArticles.find(a => a.id === articleId);
        if (!article) return;
        
        const newVisibility = !article.visible;
        
        // Preserve all existing article data when only changing visibility
        const url = `${GOOGLE_SCRIPT_URL}?action=updateArticle&id=${articleId}&titre=${encodeURIComponent(article.titre)}&contenu=${encodeURIComponent(article.contenu || '')}&image_url=${encodeURIComponent(article.image_url || '')}&visible=${newVisibility}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccessToast(`Article ${newVisibility ? 'affiché' : 'masqué'}`);
                    loadArticles();
                    
                    // Add log for visibility toggle
                    const logAction = `Article ${newVisibility ? 'affiché' : 'masqué'}: ${article.titre.substring(0, 50)}${article.titre.length > 50 ? '...' : ''}`;
                    sendLogWithIP(logAction);
                } else {
                    showErrorToast('Erreur lors de la modification');
                }
            })
            .catch(error => {
                console.error('Error toggling article visibility:', error);
                showErrorToast('Erreur de connexion');
            });
    }
    
    function deleteArticle(articleId) {
        const article = newsArticles.find(a => a.id === articleId);
        if (!article) return;
        
        // Store article to delete and show confirmation modal
        articleToDelete = article;
        
        // Update modal content
        deleteArticleText.textContent = article.titre;
        
        // Show modal
        deleteArticleModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Delete modal functions
    function closeDeleteArticleModal() {
        deleteArticleModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        articleToDelete = null;
    }
    
    function performDeleteArticle() {
        if (!articleToDelete) return;
        
        const articleId = articleToDelete.id;
        const articleTitle = articleToDelete.titre;
        
        // Show loading state
        confirmDeleteArticleBtn.disabled = true;
        confirmDeleteArticleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Suppression...';
        
        const url = `${GOOGLE_SCRIPT_URL}?action=deleteArticle&id=${articleId}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccessToast('Article supprimé avec succès');
                    closeDeleteArticleModal();
                    loadArticles();
                    loadNewsStats(); // Reload news stats
                    
                    // Add log for article deletion
                    const logAction = `Article supprimé: ${articleTitle.substring(0, 50)}${articleTitle.length > 50 ? '...' : ''}`;
                    sendLogWithIP(logAction);
                } else {
                    showErrorToast('Erreur lors de la suppression');
                }
            })
            .catch(error => {
                console.error('Error deleting article:', error);
                showErrorToast('Erreur de connexion');
            })
            .finally(() => {
                // Reset button state
                confirmDeleteArticleBtn.disabled = false;
                confirmDeleteArticleBtn.innerHTML = '<i class="fas fa-trash"></i> Supprimer définitivement';
            });
    }
    
    // Loading and Empty States for News
    function showNewsLoading() {
        newsLoading.style.display = 'block';
        newsList.style.display = 'none';
        newsEmpty.style.display = 'none';
    }
    
    function hideNewsLoading() {
        newsLoading.style.display = 'none';
    }
    
    function showNewsEmpty() {
        newsList.style.display = 'none';
        newsEmpty.style.display = 'block';
    }
    
    // Handle News Search
    function handleNewsSearch() {
        const searchTerm = newsSearchInput.value.trim().toLowerCase();
        currentNewsSearchTerm = searchTerm;
        
        if (searchTerm === '') {
            filteredArticles = [...newsArticles];
            clearNewsSearchBtn.style.display = 'none';
        } else {
            filteredArticles = newsArticles.filter(article => {
                return article.titre.toLowerCase().includes(searchTerm) ||
                       (article.contenu && article.contenu.toLowerCase().includes(searchTerm)) ||
                       article.id.toString().toLowerCase().includes(searchTerm);
            });
            clearNewsSearchBtn.style.display = 'block';
        }
        
        renderArticles();
        updateNewsSearchResults();
    }
    
    // Clear News Search
    function clearNewsSearch() {
        newsSearchInput.value = '';
        currentNewsSearchTerm = '';
        filteredArticles = [...newsArticles];
        clearNewsSearchBtn.style.display = 'none';
        renderArticles();
        updateNewsSearchResults();
        newsSearchInput.focus();
    }
    
    // Update News Search Results
    function updateNewsSearchResults() {
        const searchTerm = newsSearchInput.value.trim();
        
        if (searchTerm && searchTerm !== '') {
            const resultCount = filteredArticles.length;
            newsSearchResultsText.textContent = `${resultCount} résultat${resultCount !== 1 ? 's' : ''} trouvé${resultCount !== 1 ? 's' : ''}`;
            newsSearchResults.style.display = 'block';
        } else {
            newsSearchResults.style.display = 'none';
        }
    }
    
    // Load News Statistics
    function loadNewsStats() {
        const url = `${GOOGLE_SCRIPT_URL}?action=getNewsStats`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.stats) {
                    const stats = data.stats;
                    
                    // Update news card with statistics
                    const newsCard = document.querySelector('.admin-card:nth-child(3)');
                    if (newsCard) {
                        const cardContent = newsCard.querySelector('.card-content');
                        const existingStats = cardContent.querySelector('.news-stats');
                        const placeholder = cardContent.querySelector('#newsStatsPlaceholder');
                        
                        // Create stats element
                        const statsElement = document.createElement('div');
                        statsElement.className = 'news-stats';
                        statsElement.innerHTML = `
                            <div class="stats-container">
                                <div class="stat-item">
                                    <span class="stat-number">${stats.totalArticles}</span>
                                    <span class="stat-label">Articles</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number">${stats.visibleArticles}</span>
                                    <span class="stat-label">Publiés</span>
                                </div>
                            </div>
                        `;
                        
                        // If placeholder exists, replace it with animation
                        if (placeholder) {
                            // Add fade out animation to placeholder
                            placeholder.style.transition = 'all 0.5s ease';
                            placeholder.style.opacity = '0';
                            placeholder.style.transform = 'scale(0.95)';
                            
                            setTimeout(() => {
                                // Replace placeholder with real stats
                                placeholder.replaceWith(statsElement);
                                
                                // Add fade in animation to new stats
                                statsElement.style.opacity = '0';
                                statsElement.style.transform = 'scale(0.95)';
                                
                                setTimeout(() => {
                                    statsElement.style.transition = 'all 0.5s ease';
                                    statsElement.style.opacity = '1';
                                    statsElement.style.transform = 'scale(1)';
                                }, 50);
                            }, 500);
                        } else {
                            // Remove existing stats if any
                            if (existingStats) {
                                existingStats.remove();
                            }
                            
                            // Insert stats before the button
                            const cardBtn = cardContent.querySelector('.card-btn');
                            if (cardBtn) {
                                cardContent.insertBefore(statsElement, cardBtn);
                            } else {
                                cardContent.appendChild(statsElement);
                            }
                            
                            // Add fade in animation
                            statsElement.style.opacity = '0';
                            statsElement.style.transform = 'scale(0.95)';
                            
                            setTimeout(() => {
                                statsElement.style.transition = 'all 0.5s ease';
                                statsElement.style.opacity = '1';
                                statsElement.style.transform = 'scale(1)';
                            }, 50);
                        }
                    }
                } else {
                    // If no data, show error state in placeholder
                    const placeholder = document.querySelector('#newsStatsPlaceholder');
                    if (placeholder) {
                        placeholder.innerHTML = `
                            <div class="stats-container">
                                <div class="stat-item">
                                    <span class="stat-number">--</span>
                                    <span class="stat-label">Articles</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number">--</span>
                                    <span class="stat-label">Publiés</span>
                                </div>
                            </div>
                        `;
                        placeholder.style.animation = 'none';
                        placeholder.style.opacity = '0.6';
                    }
                }
            })
            .catch(error => {
                console.error('Error loading news stats:', error);
                
                // Show error state in placeholder
                const placeholder = document.querySelector('#newsStatsPlaceholder');
                if (placeholder) {
                    placeholder.innerHTML = `
                        <div class="stats-container">
                            <div class="stat-item">
                                <span class="stat-number">--</span>
                                <span class="stat-label">Articles</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">--</span>
                                <span class="stat-label">Publiés</span>
                            </div>
                        </div>
                    `;
                    placeholder.style.animation = 'none';
                    placeholder.style.opacity = '0.6';
                }
            });
    }
    
    // Reset News Stats Placeholder
    function resetNewsStatsPlaceholder() {
        const newsCard = document.querySelector('.admin-card:nth-child(3)');
        if (newsCard) {
            const cardContent = newsCard.querySelector('.card-content');
            const existingStats = cardContent.querySelector('.news-stats');
            const placeholder = cardContent.querySelector('#newsStatsPlaceholder');
            
            // Remove existing stats if any
            if (existingStats && !existingStats.id) {
                existingStats.remove();
            }
            
            // Reset placeholder if it exists
            if (placeholder) {
                placeholder.innerHTML = `
                    <div class="stats-container">
                        <div class="stat-item">
                            <div class="stat-loading">
                                <i class="fas fa-spinner fa-spin"></i>
                            </div>
                            <span class="stat-label">Articles</span>
                        </div>
                        <div class="stat-item">
                            <div class="stat-loading">
                                <i class="fas fa-spinner fa-spin"></i>
                            </div>
                            <span class="stat-label">Publiés</span>
                        </div>
                    </div>
                `;
                placeholder.style.animation = 'pulse 2s ease-in-out infinite';
                placeholder.style.opacity = '0.8';
                placeholder.style.transform = 'scale(1)';
            }
        }
    }
    
    // Refresh News Data
    function refreshNewsData() {
        // Show loading animation on refresh button
        const refreshBtn = document.getElementById('refreshNewsBtn');
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualisation...';
        refreshBtn.disabled = true;
        
        // Reset placeholder first
        resetNewsStatsPlaceholder();
        
        // Refresh articles
        loadArticles();
        
        // Refresh news stats
        loadNewsStats();
        
        // Reset button after 2 seconds
        setTimeout(() => {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
            showSuccessToast('📰 Données actualités actualisées avec succès !');
        }, 2000);
    }

    // ===== EMOJI SELECTOR FUNCTIONALITY =====
}); 