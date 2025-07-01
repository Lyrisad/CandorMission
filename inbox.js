// Inbox Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    
    // Elements
    const loadingContainer = document.getElementById('loadingContainer');
    const messagesContainer = document.getElementById('messagesContainer');
    const messagesTableBody = document.getElementById('messagesTableBody');
    const emptyState = document.getElementById('emptyState');
    const unreadCount = document.getElementById('unreadCount');
    const refreshBtn = document.getElementById('refreshBtn');
    const selectAll = document.getElementById('selectAll');
    const bulkActions = document.getElementById('bulkActions');
    const selectedCount = document.querySelector('.selected-count');
    const bulkArchiveBtn = document.getElementById('bulkArchiveBtn');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    const messageModal = document.getElementById('messageModal');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.getElementById('closeBtn');
    const archiveBtn = document.getElementById('archiveBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    
    // Archive elements
    const archivesLoadingContainer = document.getElementById('archivesLoadingContainer');
    const archivesContainer = document.getElementById('archivesContainer');
    const archivesTableBody = document.getElementById('archivesTableBody');
    const archivesEmptyState = document.getElementById('archivesEmptyState');
    const archivedCount = document.getElementById('archivedCount');
    
    // Confirmation modal elements
    const confirmModal = document.getElementById('confirmModal');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmOk = document.getElementById('confirmOk');
    const confirmCancel = document.getElementById('confirmCancel');
    
    // State
    let messages = [];
    let archivedMessages = [];
    let selectedMessages = new Set();
    let currentMessageId = null;
    let confirmCallback = null;
    let isViewingArchivedMessage = false;
    
    // Initialize
    loadMessages();
    loadArchives();
    
    // Event Listeners
    refreshBtn.addEventListener('click', () => {
        loadMessages();
        loadArchives();
    });
    selectAll.addEventListener('change', handleSelectAll);
    bulkArchiveBtn.addEventListener('click', handleBulkArchive);
    bulkDeleteBtn.addEventListener('click', handleBulkDelete);
    closeBtn.addEventListener('click', closeMessageModal);
    archiveBtn.addEventListener('click', handleArchive);
    deleteBtn.addEventListener('click', handleDelete);
    
    // Confirmation modal event listeners
    confirmOk.addEventListener('click', handleConfirmOk);
    confirmCancel.addEventListener('click', handleConfirmCancel);
    
    // Close confirmation modal when clicking outside
    confirmModal.addEventListener('click', function(e) {
        if (e.target === confirmModal) {
            handleConfirmCancel();
        }
    });
    
    // Close confirmation modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (messageModal.style.display === 'block') {
                closeMessageModal();
            } else if (confirmModal.style.display === 'block') {
                handleConfirmCancel();
            }
        }
    });
    
    // Close modal when clicking outside
    messageModal.addEventListener('click', function(e) {
        if (e.target === messageModal) {
            closeMessageModal();
        }
    });
    
    // Load messages from Google Apps Script
    function loadMessages() {
        showLoading();
        
        const url = `${GOOGLE_SCRIPT_URL}?action=readMessages`;
        
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log('Messages loaded:', data);
                
                if (data.success) {
                    messages = data.values || [];
                    renderMessages();
                    updateUnreadCount();
                } else {
                    showError('Erreur lors du chargement des messages: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error loading messages:', error);
                showError('Erreur de connexion au serveur');
            })
            .finally(() => {
                hideLoading();
                // Always show the messages container
                messagesContainer.style.display = 'block';
            });
    }
    
    // Load archived messages from Google Apps Script
    function loadArchives() {
        showArchivesLoading();
        
        const url = `${GOOGLE_SCRIPT_URL}?action=readArchives`;
        
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log('Archives loaded:', data);
                
                if (data.success) {
                    archivedMessages = data.values || [];
                    renderArchives();
                    updateArchivedCount();
                } else {
                    console.log('No archives found or error:', data.error);
                    archivedMessages = [];
                    renderArchives();
                    updateArchivedCount();
                }
            })
            .catch(error => {
                console.error('Error loading archives:', error);
                archivedMessages = [];
                renderArchives();
                updateArchivedCount();
            })
            .finally(() => {
                hideArchivesLoading();
                // Always show the archives container
                archivesContainer.style.display = 'block';
            });
    }
    
    // Render messages in table
    function renderMessages() {
        const tbody = messagesTableBody;
        tbody.innerHTML = '';
        
        if (messages.length === 0) {
            // Show empty state within the table
            const emptyRow = document.createElement('tr');
            emptyRow.className = 'empty-table-row';
            emptyRow.innerHTML = `
                <td colspan="8" class="empty-table-cell">
                    <div class="empty-table-content">
                        <i class="fas fa-inbox"></i>
                        <h3>Vous n'avez pas de messages</h3>
                        <p>La boîte de réception est vide</p>
                    </div>
                </td>
            `;
            tbody.appendChild(emptyRow);
            
            // Hide bulk actions and select all when no messages
            bulkActions.style.display = 'none';
            selectAll.style.display = 'none';
            
            return;
        }
        
        // Show select all checkbox when there are messages
        selectAll.style.display = 'block';
        
        messages.forEach((message, index) => {
            const row = document.createElement('tr');
            row.className = message.read ? '' : 'unread';
            row.dataset.messageId = message.id;
            
            // Use the DATE column from the sheet
            const date = message.date ? new Date(message.date) : new Date();
            const formattedDate = date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="select-checkbox message-checkbox" data-message-id="${message.id}">
                </td>
                <td>
                    <span class="status-badge ${message.read ? 'status-read' : 'status-unread'}">
                        ${message.read ? 'Lu' : 'Inconsulté'}
                    </span>
                </td>
                <td>${escapeHtml(message.name)}</td>
                <td>${escapeHtml(message.email)}</td>
                <td>${escapeHtml(message.phone)}</td>
                <td>
                    <div class="message-preview ${message.read ? '' : 'unread'}">
                        ${escapeHtml(message.message)}
                    </div>
                </td>
                <td class="message-date">${formattedDate}</td>
                <td>
                    <div class="message-actions">
                        <button class="action-btn view-btn" title="Voir le message">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn archive-btn" title="Archiver">
                            <i class="fas fa-archive"></i>
                        </button>
                        <button class="action-btn delete-btn" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
            
            // Add event listeners to the new row
            const checkboxes = row.querySelectorAll('.message-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', handleMessageSelect);
                checkbox.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent row click when clicking checkbox
                });
            });
            
            const viewBtn = row.querySelector('.view-btn');
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showMessageDetails(message);
            });
            
            const archiveBtn = row.querySelector('.archive-btn');
            archiveBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                archiveMessage(message.id);
            });
            
            const deleteBtn = row.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteMessage(message.id);
            });
            
            // Row click to view message
            row.addEventListener('click', () => {
                showMessageDetails(message);
            });
        });
    }
    
    // Render archived messages in table
    function renderArchives() {
        const tbody = archivesTableBody;
        tbody.innerHTML = '';
        
        if (archivedMessages.length === 0) {
            // Show empty state within the archives table
            const emptyRow = document.createElement('tr');
            emptyRow.className = 'empty-archive-row';
            emptyRow.innerHTML = `
                <td colspan="7" class="empty-archive-cell">
                    <div class="empty-archive-content">
                        <i class="fas fa-archive"></i>
                        <h3>Aucune archive</h3>
                        <p>Les messages archivés apparaîtront ici</p>
                    </div>
                </td>
            `;
            tbody.appendChild(emptyRow);
            return;
        }
        
        archivedMessages.forEach((message, index) => {
            const row = document.createElement('tr');
            row.dataset.messageId = message.id;
            
            // Use the DATE and ARCHIVE_DATE columns from the sheet
            const sendDate = message.date ? new Date(message.date) : new Date();
            const formattedSendDate = sendDate.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const archiveDate = message.archiveDate ? new Date(message.archiveDate) : new Date();
            const formattedArchiveDate = archiveDate.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            row.innerHTML = `
                <td>${escapeHtml(message.name)}</td>
                <td>${escapeHtml(message.email)}</td>
                <td>${escapeHtml(message.phone)}</td>
                <td>
                    <div class="archive-message-preview">
                        ${escapeHtml(message.message)}
                    </div>
                </td>
                <td class="archive-date">${formattedSendDate}</td>
                <td class="archive-date">${formattedArchiveDate}</td>
                <td>
                    <div class="archive-actions">
                        <button class="archive-action-btn view-archive-btn" title="Voir le message">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="archive-action-btn restore-btn" title="Restaurer">
                            <i class="fas fa-undo"></i>
                        </button>
                        <button class="archive-action-btn delete-archive-btn" title="Supprimer définitivement">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
            
            // Add event listeners to the new row
            const viewBtn = row.querySelector('.view-archive-btn');
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showArchiveDetails(message);
            });
            
            const restoreBtn = row.querySelector('.restore-btn');
            restoreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                restoreMessage(message.id);
            });
            
            const deleteBtn = row.querySelector('.delete-archive-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteArchivedMessage(message.id);
            });
            
            // Row click to view message
            row.addEventListener('click', () => {
                showArchiveDetails(message);
            });
        });
    }
    
    // Show message details in modal
    function showMessageDetails(message) {
        currentMessageId = message.id;
        isViewingArchivedMessage = false;
        
        // Use the DATE column from the sheet
        const date = message.date ? new Date(message.date) : new Date();
        const formattedDate = date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        modalBody.innerHTML = `
            <div class="message-detail">
                <h3>De :</h3>
                <p>${escapeHtml(message.name)}</p>
            </div>
            <div class="message-detail">
                <h3>Email :</h3>
                <p>${escapeHtml(message.email)}</p>
            </div>
            <div class="message-detail">
                <h3>Téléphone :</h3>
                <p>${escapeHtml(message.phone)}</p>
            </div>
            <div class="message-detail">
                <h3>Date :</h3>
                <p>${formattedDate}</p>
            </div>
            <div class="message-detail">
                <h3>Message :</h3>
                <div class="message-content">
                    ${escapeHtml(message.message).replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
        
        // Update modal buttons for normal messages
        archiveBtn.innerHTML = '<i class="fas fa-archive"></i> Archiver';
        archiveBtn.className = 'btn btn-secondary';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Supprimer';
        deleteBtn.className = 'btn btn-danger';
        
        messageModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Mark as read if unread
        if (!message.read) {
            markAsRead(message.id);
        }
    }
    
    // Close message modal
    function closeMessageModal() {
        messageModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentMessageId = null;
    }
    
    // Mark message as read
    function markAsRead(messageId) {
        const url = `${GOOGLE_SCRIPT_URL}?action=markAsRead&id=${encodeURIComponent(messageId)}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update local state
                    const message = messages.find(m => m.id === messageId);
                    if (message) {
                        message.read = true;
                        updateUnreadCount();
                        // Refresh the display to show the updated status
                        renderMessages();
                    }
                }
            })
            .catch(error => {
                console.error('Error marking as read:', error);
            });
    }
    
    // Custom confirmation function
    function showConfirm(title, message, callback) {
        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        confirmCallback = callback;
        confirmModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Handle confirmation OK
    function handleConfirmOk() {
        if (confirmCallback) {
            confirmCallback();
            // Reload the page after any confirmed action
            setTimeout(() => {
                window.location.reload();
            }, 2000); // Longer delay to ensure the action completes
        }
        closeConfirmModal();
    }
    
    // Handle confirmation Cancel
    function handleConfirmCancel() {
        closeConfirmModal();
    }
    
    // Close confirmation modal
    function closeConfirmModal() {
        confirmModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        confirmCallback = null;
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
                return sendLog(action, userIP);
            })
            .catch(error => {
                console.log('Could not get IP from ipify, using fallback');
                return sendLog(action, userIP);
            });
    }
    
    // Send log to server
    function sendLog(action, ip) {
        const url = `${GOOGLE_SCRIPT_URL}?action=addLog&action=${encodeURIComponent(action)}&ip=${encodeURIComponent(ip)}`;
        
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Log added successfully:', action);
                    return true;
                } else {
                    console.error('Error adding log:', data.error);
                    return false;
                }
            })
            .catch(error => {
                console.error('Error adding log:', error);
                return false;
            });
    }
    
    // Archive message
    function archiveMessage(messageId) {
        showConfirm(
            '🗄️ Archiver le message',
            'Êtes-vous sûr de vouloir archiver ce message ?',
            () => {
                const url = `${GOOGLE_SCRIPT_URL}?action=archiveMessage&id=${encodeURIComponent(messageId)}`;
                
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Add log first, then show success
                            addLog('Message archivé').then(() => {
                                setTimeout(() => {
                                    showSuccess('Message archivé avec succès');
                                }, 200);
                            });
                        } else {
                            showError('Erreur lors de l\'archivage: ' + data.error);
                        }
                    })
                    .catch(error => {
                        console.error('Error archiving message:', error);
                        showError('Erreur de connexion');
                    });
            }
        );
    }
    
    // Delete message
    function deleteMessage(messageId) {
        showConfirm(
            '🗑️ Supprimer le message',
            'Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.',
            () => {
                const url = `${GOOGLE_SCRIPT_URL}?action=deleteMessage&id=${encodeURIComponent(messageId)}`;
                
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Add log first, then show success
                            addLog('Message supprimé').then(() => {
                                setTimeout(() => {
                                    showSuccess('Message supprimé avec succès');
                                }, 200);
                            });
                        } else {
                            showError('Erreur lors de la suppression: ' + data.error);
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting message:', error);
                        showError('Erreur de connexion');
                    });
            }
        );
    }
    
    // Handle message selection
    function handleMessageSelect(e) {
        const messageId = e.target.dataset.messageId;
        
        if (e.target.checked) {
            selectedMessages.add(messageId);
        } else {
            selectedMessages.delete(messageId);
        }
        
        updateBulkActions();
        updateSelectAllState();
    }
    
    // Handle select all
    function handleSelectAll(e) {
        const checkboxes = document.querySelectorAll('.message-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
            const messageId = checkbox.dataset.messageId;
            
            if (e.target.checked) {
                selectedMessages.add(messageId);
            } else {
                selectedMessages.delete(messageId);
            }
        });
        
        updateBulkActions();
    }
    
    // Update select all state
    function updateSelectAllState() {
        const checkboxes = document.querySelectorAll('.message-checkbox');
        const checkedCheckboxes = document.querySelectorAll('.message-checkbox:checked');
        
        selectAll.checked = checkboxes.length > 0 && checkboxes.length === checkedCheckboxes.length;
        selectAll.indeterminate = checkedCheckboxes.length > 0 && checkboxes.length !== checkedCheckboxes.length;
    }
    
    // Update bulk actions visibility
    function updateBulkActions() {
        if (selectedMessages.size > 0) {
            bulkActions.style.display = 'flex';
            selectedCount.textContent = `${selectedMessages.size} message${selectedMessages.size > 1 ? 's' : ''} sélectionné${selectedMessages.size > 1 ? 's' : ''}`;
        } else {
            bulkActions.style.display = 'none';
        }
    }
    
    // Handle bulk archive
    function handleBulkArchive() {
        showConfirm(
            '🗄️ Archiver en masse',
            `Êtes-vous sûr de vouloir archiver ${selectedMessages.size} message${selectedMessages.size > 1 ? 's' : ''} ?`,
            () => {
                const promises = Array.from(selectedMessages).map(messageId => {
                    const url = `${GOOGLE_SCRIPT_URL}?action=archiveMessage&id=${encodeURIComponent(messageId)}`;
                    return fetch(url).then(response => response.json());
                });
                
                Promise.all(promises)
                    .then(results => {
                        const successCount = results.filter(result => result.success).length;
                        selectedMessages.clear();
                        // Add log first, then show success
                        addLog(`Archivage en masse: ${successCount} message${successCount > 1 ? 's' : ''}`).then(() => {
                            setTimeout(() => {
                                showSuccess(`${successCount} message${successCount > 1 ? 's' : ''} archivé${successCount > 1 ? 's' : ''} avec succès`);
                            }, 200);
                        });
                    })
                    .catch(error => {
                        console.error('Error bulk archiving:', error);
                        showError('Erreur lors de l\'archivage en masse');
                    });
            }
        );
    }
    
    // Handle bulk delete
    function handleBulkDelete() {
        showConfirm(
            '🗑️ Supprimer en masse',
            `Êtes-vous sûr de vouloir supprimer ${selectedMessages.size} message${selectedMessages.size > 1 ? 's' : ''} ? Cette action est irréversible.`,
            () => {
                const promises = Array.from(selectedMessages).map(messageId => {
                    const url = `${GOOGLE_SCRIPT_URL}?action=deleteMessage&id=${encodeURIComponent(messageId)}`;
                    return fetch(url).then(response => response.json());
                });
                
                Promise.all(promises)
                    .then(results => {
                        const successCount = results.filter(result => result.success).length;
                        selectedMessages.clear();
                        // Add log first, then show success
                        addLog(`Suppression en masse: ${successCount} message${successCount > 1 ? 's' : ''}`).then(() => {
                            setTimeout(() => {
                                showSuccess(`${successCount} message${successCount > 1 ? 's' : ''} supprimé${successCount > 1 ? 's' : ''} avec succès`);
                            }, 200);
                        });
                    })
                    .catch(error => {
                        console.error('Error bulk deleting:', error);
                        showError('Erreur lors de la suppression en masse');
                    });
            }
        );
    }
    
    // Handle archive from modal
    function handleArchive() {
        if (currentMessageId) {
            if (isViewingArchivedMessage) {
                // Restore archived message
                restoreMessage(currentMessageId);
            } else {
                // Archive normal message
                archiveMessage(currentMessageId);
            }
            closeMessageModal();
        }
    }
    
    // Handle delete from modal
    function handleDelete() {
        if (currentMessageId) {
            if (isViewingArchivedMessage) {
                // Delete archived message permanently
                deleteArchivedMessage(currentMessageId);
            } else {
                // Delete normal message
                deleteMessage(currentMessageId);
            }
            closeMessageModal();
        }
    }
    
    // Update unread count
    function updateUnreadCount() {
        const unreadMessages = messages.filter(message => !message.read);
        unreadCount.textContent = unreadMessages.length;
    }
    
    // Update archived count
    function updateArchivedCount() {
        archivedCount.textContent = archivedMessages.length;
    }
    
    // Show archive details in modal
    function showArchiveDetails(message) {
        currentMessageId = message.id;
        isViewingArchivedMessage = true;
        
        // Use the DATE and ARCHIVE_DATE columns from the sheet
        const sendDate = message.date ? new Date(message.date) : new Date();
        const formattedSendDate = sendDate.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const archiveDate = message.archiveDate ? new Date(message.archiveDate) : new Date();
        const formattedArchiveDate = archiveDate.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        modalBody.innerHTML = `
            <div class="message-detail">
                <h3>De :</h3>
                <p>${escapeHtml(message.name)}</p>
            </div>
            <div class="message-detail">
                <h3>Email :</h3>
                <p>${escapeHtml(message.email)}</p>
            </div>
            <div class="message-detail">
                <h3>Téléphone :</h3>
                <p>${escapeHtml(message.phone)}</p>
            </div>
            <div class="message-detail">
                <h3>Date d'envoi :</h3>
                <p>${formattedSendDate}</p>
            </div>
            <div class="message-detail">
                <h3>Date d'archivage :</h3>
                <p>${formattedArchiveDate}</p>
            </div>
            <div class="message-detail">
                <h3>Message :</h3>
                <div class="message-content">
                    ${escapeHtml(message.message).replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
        
        // Update modal buttons for archived messages
        archiveBtn.innerHTML = '<i class="fas fa-undo"></i> Restaurer';
        archiveBtn.className = 'btn btn-primary';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Supprimer définitivement';
        deleteBtn.className = 'btn btn-danger';
        
        messageModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Restore message from archive
    function restoreMessage(messageId) {
        showConfirm(
            '🔄 Restaurer le message',
            'Êtes-vous sûr de vouloir restaurer ce message ?',
            () => {
                console.log('Restoring message:', messageId);
                
                const url = `${GOOGLE_SCRIPT_URL}?action=restoreMessage&id=${encodeURIComponent(messageId)}`;
                console.log('Restore URL:', url);
                
                fetch(url)
                    .then(response => {
                        console.log('Restore response status:', response.status);
                        return response.json();
                    })
                    .then(data => {
                        console.log('Restore response data:', data);
                        if (data.success) {
                            // Add log first, then show success
                            addLog('Message restauré').then(() => {
                                setTimeout(() => {
                                    showSuccess('Message restauré avec succès');
                                }, 200);
                            });
                        } else {
                            showError('Erreur lors de la restauration: ' + data.error);
                        }
                    })
                    .catch(error => {
                        console.error('Error restoring message:', error);
                        showError('Erreur de connexion');
                    });
            }
        );
    }
    
    // Delete archived message permanently
    function deleteArchivedMessage(messageId) {
        showConfirm(
            '🗑️ Supprimer définitivement',
            'Êtes-vous sûr de vouloir supprimer définitivement ce message ? Cette action est irréversible.',
            () => {
                const url = `${GOOGLE_SCRIPT_URL}?action=deleteArchivedMessage&id=${encodeURIComponent(messageId)}`;
                
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Add log first, then show success
                            addLog('Message supprimé définitivement').then(() => {
                                setTimeout(() => {
                                    showSuccess('Message supprimé définitivement');
                                }, 200);
                            });
                        } else {
                            showError('Erreur lors de la suppression: ' + data.error);
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting archived message:', error);
                        showError('Erreur de connexion');
                    });
            }
        );
    }
    
    // Show loading state
    function showLoading() {
        loadingContainer.style.display = 'block';
        messagesContainer.style.display = 'none';
        emptyState.style.display = 'none';
    }
    
    // Hide loading state
    function hideLoading() {
        loadingContainer.style.display = 'none';
    }
    
    // Show archives loading state
    function showArchivesLoading() {
        archivesLoadingContainer.style.display = 'block';
        archivesContainer.style.display = 'none';
        archivesEmptyState.style.display = 'none';
    }
    
    // Hide archives loading state
    function hideArchivesLoading() {
        archivesLoadingContainer.style.display = 'none';
    }
    
    // Show success message
    function showSuccess(message) {
        showNotification(message, 'success');
    }
    
    // Show error message
    function showError(message) {
        showNotification(message, 'error');
    }
    
    // Show notification
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 10001;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;
        
        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        } else {
            notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    document.head.appendChild(style);
}); 