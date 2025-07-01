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
                addLog('Nouvelle connexion admin');
                
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
                    renderLogs(data.values);
                } else {
                    showLogsEmpty();
                }
            })
            .catch(error => {
                console.error('Error loading logs:', error);
                hideLogsLoading();
                showLogsEmpty();
            });
    }
    
    // Render logs
    function renderLogs(logs) {
        if (!logs || logs.length === 0) {
            showLogsEmpty();
            return;
        }
        
        logsTableBody.innerHTML = '';
        
        // Sort logs by date (newest first)
        logs.sort((a, b) => new Date(b.date + ' ' + b.heure) - new Date(a.date + ' ' + a.heure));
        
        logs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(log.id)}</td>
                <td>${escapeHtml(log.date)}</td>
                <td>${escapeHtml(log.heure)}</td>
                <td>
                    <span class="log-action ${getActionClass(log.action)}">
                        ${escapeHtml(log.action)}
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
        
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = url;
        link.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        const url = `${GOOGLE_SCRIPT_URL}?action=addLog&action=${encodeURIComponent(action)}&ip=${encodeURIComponent(ip)}`;
        
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
}); 