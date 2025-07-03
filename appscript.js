// Google Apps Script pour Candor Ma Mission
// Fichier à copier-coller dans l'éditeur Google Apps Script

// Configuration
const SPREADSHEET_NAME = "CandorMission";
const SHEET_NAME = "Messages";
const COLUMNS = ["ID", "NAME", "EMAIL", "PHONE", "MESSAGE", "READ", "DATE"];

/**
 * Génère un ID unique pour les articles
 */
function generateId() {
  var timestamp = new Date().getTime();
  var random = Math.floor(Math.random() * 1000);
  return "ART_" + timestamp + "_" + random;
}

/**
 * Fonction principale pour traiter les soumissions de formulaire
 * Cette fonction sera appelée via une requête GET
 */
function doGet(e) {
  var action = e.parameter.action;
  var result = {};

  try {
    // Ouvrir la feuille de calcul - utiliser getActiveSpreadsheet() si le script est lié au spreadsheet
    // Ou utiliser openById() avec l'ID du spreadsheet
    //var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Si le script n'est pas lié au spreadsheet, utilisez cette ligne à la place :
    var ss = SpreadsheetApp.openById("13VM6PrfwLKlxsmCQkcMQvDuzviBI2xd5C7SR-3GeqVc");

    if (action == "addMessage") {
      // Ajout d'un nouveau message dans "Messages"
      var sheet = ss.getSheetByName(SHEET_NAME);
      var name = e.parameter.name;
      var email = e.parameter.email;
      var phone = e.parameter.phone || "Non renseigné";
      var message = e.parameter.message;
      
      // Validation des champs requis
      if (!name || !email || !message) {
        result.success = false;
        result.error = "Paramètres manquants: name, email et message sont requis";
      } else if (!isValidEmail(email)) {
        result.success = false;
        result.error = "Format d'email invalide";
      } else {
        // Générer un ID unique
        var data = sheet.getDataRange().getValues();
        var newId = 1;
        if (data.length > 1) {
          var ids = data.slice(1).map(function (row) {
            return parseInt(row[0].toString().replace('MSG_', '').split('_')[0]) || 0;
          });
          newId = Math.max.apply(null, ids) + 1;
        }
        
        var uniqueId = "MSG_" + new Date().getTime() + "_" + newId;
        var currentDate = new Date();
        
        // Ajouter la nouvelle ligne avec la date
        sheet.appendRow([uniqueId, name, email, phone, message, false, currentDate]);
        
        // Ajouter un log automatique
        addAutomaticLog("Nouveau message reçu (ID: " + uniqueId + ")", "Contact Form");
        
        result.success = true;
        result.id = uniqueId;
        result.message = "Message enregistré avec succès";
      }
      
    } else if (action == "readMessages") {
      // Lecture de tous les messages dans "Messages"
      var sheet = ss.getSheetByName(SHEET_NAME);
      var data = sheet.getDataRange().getValues();
      // La première ligne est l'en-tête
      result.values = data.slice(1).map(function (row) {
        return {
          id: row[0],
          name: row[1],
          email: row[2],
          phone: row[3],
          message: row[4],
          read: row[5],
          date: row[6] // Nouvelle colonne DATE
        };
      });
      result.success = true;
      
    } else if (action == "markAsRead") {
      // Marquer un message comme lu
      var sheet = ss.getSheetByName(SHEET_NAME);
      var messageId = e.parameter.id;
      var data = sheet.getDataRange().getValues();
      var found = false;
      
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] === messageId) {
          sheet.getRange(i + 1, 6).setValue(true); // Colonne READ
          found = true;
          break;
        }
      }
      
      result.success = found;
      if (!found) result.error = "Message non trouvé";
      
    } else if (action == "deleteMessage") {
      // Suppression d'un message
      var sheet = ss.getSheetByName(SHEET_NAME);
      var messageId = e.parameter.id;
      var data = sheet.getDataRange().getValues();
      var found = false;
      
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] === messageId) {
          sheet.deleteRow(i + 1);
          found = true;
          break;
        }
      }
      
      // Ajouter un log automatique avec l'IP du client
      if (found) {
        var clientIP = e.parameter.clientIP || "Admin Panel";
        addAutomaticLog("Message supprimé (ID: " + messageId + ")", clientIP);
      }
      
      result.success = found;
      if (!found) result.error = "Message non trouvé";
      
    } else if (action == "archiveMessage") {
      // Archiver un message (déplacer vers MessagesArchive)
      var messagesSheet = ss.getSheetByName(SHEET_NAME);
      var archiveSheet = ss.getSheetByName("MessagesArchive");
      var messageId = e.parameter.id;
      
      if (!archiveSheet) {
        result.success = false;
        result.error = "Feuille 'MessagesArchive' non trouvée";
      } else {
        var data = messagesSheet.getDataRange().getValues();
        var found = false;
        
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] === messageId) {
            // Récupérer les données du message
            var messageData = data[i];
            
            // Ajouter à l'archive avec la date d'archivage
            var archiveDate = new Date();
            var archivedData = [
              messageData[0], // ID
              messageData[1], // NAME
              messageData[2], // EMAIL
              messageData[3], // PHONE
              messageData[4], // MESSAGE
              messageData[5], // READ
              messageData[6], // DATE (date d'envoi)
              archiveDate     // ARCHIVE_DATE (date d'archivage)
            ];
            
            archiveSheet.appendRow(archivedData);
            
            // Supprimer du sheet original
            messagesSheet.deleteRow(i + 1);
            
            found = true;
            break;
          }
        }
        
        // Ajouter un log automatique avec l'IP du client
        if (found) {
          var clientIP = e.parameter.clientIP || "Admin Panel";
          addAutomaticLog("Message archivé (ID: " + messageId + ")", clientIP);
        }
        
        result.success = found;
        if (!found) result.error = "Message non trouvé";
      }
      
    } else if (action == "getUnreadCount") {
      // Compter les messages non lus
      var sheet = ss.getSheetByName(SHEET_NAME);
      var data = sheet.getDataRange().getValues();
      var unreadCount = 0;
      
      for (var i = 1; i < data.length; i++) {
        if (data[i][5] === false) { // Colonne READ
          unreadCount++;
        }
      }
      
      result.success = true;
      result.count = unreadCount;
      
    } else if (action == "testConfiguration") {
      // Test de la configuration
      var sheet = ss.getSheetByName(SHEET_NAME);
      if (!sheet) {
        result.success = false;
        result.error = "Feuille 'Messages' non trouvée";
      } else {
        var data = sheet.getDataRange().getValues();
        if (data.length === 0) {
          result.success = false;
          result.error = "Feuille 'Messages' vide";
        } else {
          var headers = data[0];
          var expectedHeaders = ["ID", "NAME", "EMAIL", "PHONE", "MESSAGE", "READ", "DATE"];
          var headersMatch = expectedHeaders.every(function(header, index) {
            return headers[index] === header;
          });
          
          if (headersMatch) {
            result.success = true;
            result.message = "Configuration correcte";
            result.headers = headers;
            result.rowCount = data.length - 1;
          } else {
            result.success = false;
            result.error = "En-têtes incorrects";
            result.expected = expectedHeaders;
            result.found = headers;
          }
        }
      }
      
    } else if (action == "cleanupOldMessages") {
      // Nettoyer les anciens messages (plus de 30 jours)
      var sheet = ss.getSheetByName(SHEET_NAME);
      var data = sheet.getDataRange().getValues();
      var thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      var deletedCount = 0;
      
      // Parcourir les lignes de la fin vers le début
      for (var i = data.length - 1; i > 0; i--) {
        var row = data[i];
        var messageId = row[0];
        
        // Extraire la date de l'ID (format: MSG_timestamp_random)
        var timestamp = messageId.split('_')[1];
        if (timestamp) {
          var messageDate = new Date(parseInt(timestamp));
          if (messageDate < thirtyDaysAgo) {
            sheet.deleteRow(i + 1);
            deletedCount++;
          }
        }
      }
      
      result.success = true;
      result.deletedCount = deletedCount;
      result.message = deletedCount + " anciens messages supprimés";
      
    } else if (action == "getStats") {
      // Obtenir les statistiques des messages
      var sheet = ss.getSheetByName(SHEET_NAME);
      var data = sheet.getDataRange().getValues();
      var totalMessages = data.length - 1; // Exclure l'en-tête
      var unreadMessages = 0;
      var readMessages = 0;
      
      for (var i = 1; i < data.length; i++) {
        if (data[i][5] === true) { // Colonne READ
          readMessages++;
        } else {
          unreadMessages++;
        }
      }
      
      result.success = true;
      result.stats = {
        total: totalMessages,
        read: readMessages,
        unread: unreadMessages,
        readPercentage: totalMessages > 0 ? Math.round((readMessages / totalMessages) * 100) : 0
      };
      
    } else if (action == "readArchives") {
      // Lecture de tous les messages archivés
      var archiveSheet = ss.getSheetByName("MessagesArchive");
      if (!archiveSheet) {
        result.success = false;
        result.error = "Feuille 'MessagesArchive' non trouvée";
      } else {
        var data = archiveSheet.getDataRange().getValues();
        // La première ligne est l'en-tête
        result.values = data.slice(1).map(function (row) {
          return {
            id: row[0],
            name: row[1],
            email: row[2],
            phone: row[3],
            message: row[4],
            read: row[5],
            date: row[6], // Colonne DATE
            archiveDate: row[7] // Nouvelle colonne ARCHIVE_DATE
          };
        });
        result.success = true;
      }
      
    } else if (action == "restoreMessage") {
      // Restaurer un message depuis l'archive
      var archiveSheet = ss.getSheetByName("MessagesArchive");
      var messagesSheet = ss.getSheetByName(SHEET_NAME);
      var messageId = e.parameter.id;
      
      if (!archiveSheet || !messagesSheet) {
        result.success = false;
        result.error = "Feuilles 'MessagesArchive' ou 'Messages' non trouvées";
      } else {
        var data = archiveSheet.getDataRange().getValues();
        var found = false;
        
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] === messageId) {
            // Récupérer les données du message archivé
            var messageData = data[i];
            
            // Restaurer dans le sheet original (sans la date d'archivage)
            var restoredData = [
              messageData[0], // ID
              messageData[1], // NAME
              messageData[2], // EMAIL
              messageData[3], // PHONE
              messageData[4], // MESSAGE
              messageData[5], // READ
              messageData[6]  // DATE (date d'envoi)
            ];
            
            messagesSheet.appendRow(restoredData);
            
            // Supprimer de l'archive
            archiveSheet.deleteRow(i + 1);
            
            found = true;
            break;
          }
        }
        
        // Ajouter un log automatique avec l'IP du client
        if (found) {
          var clientIP = e.parameter.clientIP || "Admin Panel";
          addAutomaticLog("Message restauré (ID: " + messageId + ")", clientIP);
        }
        
        result.success = found;
        if (!found) result.error = "Message archivé non trouvé";
      }
      
    } else if (action == "deleteArchivedMessage") {
      // Supprimer un message archivé définitivement
      var archiveSheet = ss.getSheetByName("MessagesArchive");
      var messageId = e.parameter.id;
      
      if (!archiveSheet) {
        result.success = false;
        result.error = "Feuille 'MessagesArchive' non trouvée";
      } else if (!messageId) {
        result.success = false;
        result.error = "ID de message manquant";
      } else {
        var data = archiveSheet.getDataRange().getValues();
        var found = false;
        
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] === messageId) {
            archiveSheet.deleteRow(i + 1);
            found = true;
            break;
          }
        }
        
        result.success = found;
        if (!found) result.error = "Message archivé non trouvé";
      }
      
    } else if (action == "getFAQStats") {
      // Récupérer les statistiques FAQ (nombre de catégories et questions)
      var categoriesSheet = ss.getSheetByName("CATEGORIES");
      var faqSheet = ss.getSheetByName("FAQ");
      
      var categoriesCount = 0;
      var questionsCount = 0;
      var visibleCategoriesCount = 0;
      var visibleQuestionsCount = 0;
      
      // Compter les catégories
      if (categoriesSheet) {
        var categoriesData = categoriesSheet.getDataRange().getValues();
        categoriesCount = categoriesData.length - 1; // Exclure l'en-tête
        
        // Compter les catégories visibles
        for (var i = 1; i < categoriesData.length; i++) {
          if (categoriesData[i][5] === true) { // Colonne visible
            visibleCategoriesCount++;
          }
        }
      }
      
      // Compter les questions
      if (faqSheet) {
        var faqData = faqSheet.getDataRange().getValues();
        questionsCount = faqData.length - 1; // Exclure l'en-tête
        
        // Compter les questions visibles
        for (var i = 1; i < faqData.length; i++) {
          if (faqData[i][6] === true) { // Colonne visible
            visibleQuestionsCount++;
          }
        }
      }
      
      result.success = true;
      result.stats = {
        totalCategories: categoriesCount,
        totalQuestions: questionsCount,
        visibleCategories: visibleCategoriesCount,
        visibleQuestions: visibleQuestionsCount
      };
      
    } else if (action == "getMessageStats") {
      // Récupérer les statistiques des messages (total, non lus, archivés)
      var messagesSheet = ss.getSheetByName(SHEET_NAME);
      var archiveSheet = ss.getSheetByName("MessagesArchive");
      
      var totalMessages = 0;
      var unreadMessages = 0;
      var archivedMessages = 0;
      
      // Compter les messages dans la feuille principale
      if (messagesSheet) {
        var messagesData = messagesSheet.getDataRange().getValues();
        totalMessages = messagesData.length - 1; // Exclure l'en-tête
        
        // Compter les messages non lus
        for (var i = 1; i < messagesData.length; i++) {
          if (messagesData[i][5] === false) { // Colonne READ
            unreadMessages++;
          }
        }
      }
      
      // Compter les messages archivés
      if (archiveSheet) {
        var archiveData = archiveSheet.getDataRange().getValues();
        archivedMessages = archiveData.length - 1; // Exclure l'en-tête
      }
      
      result.success = true;
      result.stats = {
        totalMessages: totalMessages,
        unreadMessages: unreadMessages,
        archivedMessages: archivedMessages
      };
      
    } else if (action == "readLogs") {
      // Lecture de tous les logs
      var logsSheet = ss.getSheetByName("LOGS");
      if (!logsSheet) {
        result.success = false;
        result.error = "Feuille 'LOGS' non trouvée";
      } else {
        var data = logsSheet.getDataRange().getValues();
        // La première ligne est l'en-tête
        result.values = data.slice(1).map(function (row) {
          return {
            id: row[0],
            date: row[1],
            heure: row[2],
            action: row[3],
            ip: row[4]
          };
        });
        result.success = true;
      }
      
    } else if (action == "addLog") {
      // Ajout d'un nouveau log
      var logsSheet = ss.getSheetByName("LOGS");
      var logMessage = e.parameter.logMessage;
      var ip = e.parameter.ip || "N/A";
      
      if (!logsSheet) {
        result.success = false;
        result.error = "Feuille 'LOGS' non trouvée";
      } else if (!logMessage) {
        result.success = false;
        result.error = "Message de log manquant";
      } else {
        // Générer un ID unique
        var data = logsSheet.getDataRange().getValues();
        var newId = data.length; // ID basé sur le numéro de ligne
        
        // Date et heure actuelles au format français
        var now = new Date();
        
        // Formatage manuel de la date (DD/MM/YYYY)
        var day = String(now.getDate()).padStart(2, '0');
        var month = String(now.getMonth() + 1).padStart(2, '0');
        var year = now.getFullYear();
        var date = day + '/' + month + '/' + year;
        
        // Formatage manuel de l'heure (HHhMMmSSs) pour éviter la transformation automatique de Google Sheets
        var hours = String(now.getHours()).padStart(2, '0');
        var minutes = String(now.getMinutes()).padStart(2, '0');
        var seconds = String(now.getSeconds()).padStart(2, '0');
        var heure = hours + 'h' + minutes + 'm' + seconds + 's';
        
        // Rendre l'action plus descriptive
        var descriptiveAction = logMessage;
        
        // Debug: Log the received message
        console.log('Message de log reçu:', logMessage);
        
        if (logMessage === 'Connexion admin') {
          descriptiveAction = 'Connexion utilisateur';
        } else if (logMessage === 'Déconnexion admin') {
          descriptiveAction = 'Déconnexion utilisateur';
        } else if (logMessage === 'addLog') {
          descriptiveAction = 'Connexion manuelle';
        } else if (logMessage && logMessage.includes('archiv')) {
          descriptiveAction = logMessage; // Keep as is, now includes ID
        } else if (logMessage && logMessage.includes('supprim')) {
          descriptiveAction = logMessage; // Keep as is, now includes ID
        } else if (logMessage && logMessage.includes('restaur')) {
          descriptiveAction = logMessage; // Keep as is, now includes ID
        } else if (logMessage && logMessage.includes('connexion')) {
          descriptiveAction = 'Connexion admin';
        } else if (logMessage && logMessage.includes('déconnexion')) {
          descriptiveAction = 'Déconnexion admin';
        } else {
          // Fallback: keep the original message
          descriptiveAction = logMessage;
        }
        
        console.log('Message transformé:', descriptiveAction);
        
        // Ajouter le nouveau log
        logsSheet.appendRow([newId, date, heure, descriptiveAction, ip]);
        result.success = true;
        result.message = "Log ajouté avec succès";
      }
      
    } else if (action == "exportLogs") {
      // Export des logs en CSV
      var logsSheet = ss.getSheetByName("LOGS");
      if (!logsSheet) {
        result.success = false;
        result.error = "Feuille 'LOGS' non trouvée";
      } else {
        var data = logsSheet.getDataRange().getValues();
        var csvContent = "";
        
        // Convertir en CSV
        for (var i = 0; i < data.length; i++) {
          var row = data[i];
          var csvRow = row.map(function(cell) {
            // Échapper les guillemets et entourer de guillemets si nécessaire
            var cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
              return '"' + cellStr.replace(/"/g, '""') + '"';
            }
            return cellStr;
          });
          csvContent += csvRow.join(',') + '\n';
        }
        
        result.success = true;
        result.csv = csvContent;
        result.filename = "logs_" + new Date().toISOString().split('T')[0] + ".csv";
      }
      
    } else if (action == "readCategories") {
      // Lecture de toutes les catégories
      var categoriesSheet = ss.getSheetByName("CATEGORIES");
      if (!categoriesSheet) {
        result.success = false;
        result.error = "Feuille 'CATEGORIES' non trouvée";
      } else {
        var data = categoriesSheet.getDataRange().getValues();
        // La première ligne est l'en-tête
        result.values = data.slice(1).map(function (row) {
          return {
            id: row[0],
            nom: row[1],
            description: row[2],
            cree_le: row[3],
            modifie_le: row[4],
            visible: row[5],
            emoji: row[6] || '❓'
          };
        });
        result.success = true;
      }
      
    } else if (action == "addCategory") {
      // Ajouter une nouvelle catégorie
      var categoriesSheet = ss.getSheetByName("CATEGORIES");
      var nom = e.parameter.nom;
      var description = e.parameter.description || "";
      var emoji = e.parameter.emoji || "❓";
      var visible = e.parameter.visible === 'true';
      
      if (!categoriesSheet) {
        result.success = false;
        result.error = "Feuille 'CATEGORIES' non trouvée";
      } else if (!nom) {
        result.success = false;
        result.error = "Le nom de la catégorie est requis";
      } else {
        // Générer un ID unique
        var data = categoriesSheet.getDataRange().getValues();
        var newId = 1;
        if (data.length > 1) {
          var ids = data.slice(1).map(function (row) {
            return parseInt(row[0].toString().replace('CAT_', '')) || 0;
          });
          newId = Math.max.apply(null, ids) + 1;
        }
        
        var uniqueId = "CAT_" + newId;
        var currentDate = new Date();
        
        // Ajouter la nouvelle ligne avec emoji à la fin
        categoriesSheet.appendRow([uniqueId, nom, description, currentDate, null, visible, emoji]);
        
        result.success = true;
        result.id = uniqueId;
        result.message = "Catégorie créée avec succès";
      }
      
    } else if (action == "updateCategory") {
      // Mettre à jour une catégorie
      var categoriesSheet = ss.getSheetByName("CATEGORIES");
      var categoryId = e.parameter.id;
      var nom = e.parameter.nom;
      var description = e.parameter.description;
      var emoji = e.parameter.emoji;
      var visible = e.parameter.visible;
      
      if (!categoriesSheet) {
        result.success = false;
        result.error = "Feuille 'CATEGORIES' non trouvée";
      } else if (!categoryId) {
        result.success = false;
        result.error = "ID de catégorie manquant";
      } else {
        var data = categoriesSheet.getDataRange().getValues();
        var found = false;
        
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] === categoryId) {
            var currentDate = new Date();
            
            // Mettre à jour seulement les champs fournis
            if (nom !== undefined) categoriesSheet.getRange(i + 1, 2).setValue(nom);
            if (description !== undefined) categoriesSheet.getRange(i + 1, 3).setValue(description);
            categoriesSheet.getRange(i + 1, 5).setValue(currentDate); // MODIFIE_LE
            if (visible !== undefined) categoriesSheet.getRange(i + 1, 6).setValue(visible === 'true');
            if (emoji !== undefined) categoriesSheet.getRange(i + 1, 7).setValue(emoji);
            
            found = true;
            break;
          }
        }
        
        result.success = found;
        if (!found) result.error = "Catégorie non trouvée";
      }
      
    } else if (action == "deleteCategory") {
      // Supprimer une catégorie
      var categoriesSheet = ss.getSheetByName("CATEGORIES");
      var categoryId = e.parameter.id;
      
      if (!categoriesSheet) {
        result.success = false;
        result.error = "Feuille 'CATEGORIES' non trouvée";
      } else if (!categoryId) {
        result.success = false;
        result.error = "ID de catégorie manquant";
      } else {
        var data = categoriesSheet.getDataRange().getValues();
        var found = false;
        
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] === categoryId) {
            categoriesSheet.deleteRow(i + 1);
            found = true;
            break;
          }
        }
        
        result.success = found;
        if (!found) result.error = "Catégorie non trouvée";
      }
      
    } else if (action == "readFAQs") {
      // Lecture de toutes les FAQ
      var faqSheet = ss.getSheetByName("FAQ");
      if (!faqSheet) {
        result.success = false;
        result.error = "Feuille 'FAQ' non trouvée";
      } else {
        var data = faqSheet.getDataRange().getValues();
        // La première ligne est l'en-tête
        result.values = data.slice(1).map(function (row) {
          return {
            id: row[0],
            question: row[1],
            reponse: row[2],
            categorie: row[3],
            cree_le: row[4],
            modifie_le: row[5],
            visible: row[6]
          };
        });
        result.success = true;
      }
      
    } else if (action == "addFAQ") {
      // Ajouter une nouvelle FAQ
      var faqSheet = ss.getSheetByName("FAQ");
      var question = e.parameter.question;
      var reponse = e.parameter.reponse;
      var categorie = e.parameter.categorie;
      var visible = e.parameter.visible === 'true';
      
      if (!faqSheet) {
        result.success = false;
        result.error = "Feuille 'FAQ' non trouvée";
      } else if (!question || !reponse || !categorie) {
        result.success = false;
        result.error = "Question, réponse et catégorie sont requis";
      } else {
        // Générer un ID unique
        var data = faqSheet.getDataRange().getValues();
        var newId = 1;
        if (data.length > 1) {
          var ids = data.slice(1).map(function (row) {
            return parseInt(row[0].toString().replace('FAQ_', '')) || 0;
          });
          newId = Math.max.apply(null, ids) + 1;
        }
        
        var uniqueId = "FAQ_" + newId;
        var currentDate = new Date();
        
        // Ajouter la nouvelle ligne
        faqSheet.appendRow([uniqueId, question, reponse, categorie, currentDate, null, visible]);
        
        result.success = true;
        result.id = uniqueId;
        result.message = "FAQ créée avec succès";
      }
      
    } else if (action == "updateFAQ") {
      // Mettre à jour une FAQ
      var faqSheet = ss.getSheetByName("FAQ");
      var faqId = e.parameter.id;
      var question = e.parameter.question;
      var reponse = e.parameter.reponse;
      var categorie = e.parameter.categorie;
      var visible = e.parameter.visible;
      
      if (!faqSheet) {
        result.success = false;
        result.error = "Feuille 'FAQ' non trouvée";
      } else if (!faqId) {
        result.success = false;
        result.error = "ID de FAQ manquant";
      } else {
        var data = faqSheet.getDataRange().getValues();
        var found = false;
        
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] === faqId) {
            var currentDate = new Date();
            
            // Mettre à jour seulement les champs fournis
            if (question !== undefined) faqSheet.getRange(i + 1, 2).setValue(question);
            if (reponse !== undefined) faqSheet.getRange(i + 1, 3).setValue(reponse);
            if (categorie !== undefined) faqSheet.getRange(i + 1, 4).setValue(categorie);
            faqSheet.getRange(i + 1, 6).setValue(currentDate); // MODIFIE_LE
            if (visible !== undefined) faqSheet.getRange(i + 1, 7).setValue(visible === 'true');
            
            found = true;
            break;
          }
        }
        
        result.success = found;
        if (!found) result.error = "FAQ non trouvée";
      }
      
    } else if (action == "deleteFAQ") {
      // Supprimer une FAQ
      var faqSheet = ss.getSheetByName("FAQ");
      var faqId = e.parameter.id;
      
      if (!faqSheet) {
        result.success = false;
        result.error = "Feuille 'FAQ' non trouvée";
      } else if (!faqId) {
        result.success = false;
        result.error = "ID de FAQ manquant";
      } else {
        var data = faqSheet.getDataRange().getValues();
        var found = false;
        
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] === faqId) {
            faqSheet.deleteRow(i + 1);
            found = true;
            break;
          }
        }
        
        result.success = found;
        if (!found) result.error = "FAQ non trouvée";
      }
      
    } else if (action == "readArticles") {
      // Lecture de tous les articles
      var articlesSheet = ss.getSheetByName("Articles");
      if (!articlesSheet) {
        result.success = false;
        result.error = "Feuille 'Articles' non trouvée";
      } else {
        var data = articlesSheet.getDataRange().getValues();
        if (data.length <= 1) {
          result.success = true;
          result.values = [];
        } else {
          var articles = [];
          for (var i = 1; i < data.length; i++) {
            var row = data[i];
            var article = {
              id: row[0],
              titre: row[1],
              contenu: row[2],
              image_url: row[3] || '',
              cree_le: row[4],
              modifie_le: row[5] || '',
              visible: row[6] === true || row[6] === 'TRUE'
            };
            articles.push(article);
          }
          result.success = true;
          result.values = articles;
        }
      }
    } else if (action == "addArticle") {
      // Ajouter un nouvel article
      var articlesSheet = ss.getSheetByName("Articles");
      var titre = e.parameter.titre;
      var contenu = e.parameter.contenu;
      var image_url = e.parameter.image_url || '';
      var visible = e.parameter.visible === 'true';
      
      if (!articlesSheet) {
        result.success = false;
        result.error = "Feuille 'Articles' non trouvée";
      } else if (!titre || !contenu) {
        result.success = false;
        result.error = "Le titre et le contenu de l'article sont requis";
      } else {
        var now = new Date();
        var id = generateId();
        
        var newRow = [
          id,
          titre,
          contenu,
          image_url,
          now,
          '', // modifie_le (empty for new articles)
          visible === 'true' || visible === true
        ];
        
        articlesSheet.appendRow(newRow);
        
        // Add log
        addAutomaticLog(`Article créé: ${titre}`, 'admin');
        
        result.success = true;
        result.id = id;
        result.message = "Article créé avec succès";
      }
    } else if (action == "updateArticle") {
      // Mettre à jour un article
      var articlesSheet = ss.getSheetByName("Articles");
      var id = e.parameter.id;
      var titre = e.parameter.titre;
      var contenu = e.parameter.contenu;
      var image_url = e.parameter.image_url;
      var visible = e.parameter.visible;
      
      if (!articlesSheet) {
        result.success = false;
        result.error = "Feuille 'Articles' non trouvée";
      } else if (!id) {
        result.success = false;
        result.error = "ID de l'article manquant";
      } else {
        var data = articlesSheet.getDataRange().getValues();
        var found = false;
        
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] == id) {
            var now = new Date();
            
            // Update only the fields that are provided (not undefined)
            if (titre !== undefined && titre !== null) articlesSheet.getRange(i + 1, 2).setValue(titre);
            if (contenu !== undefined && contenu !== null) articlesSheet.getRange(i + 1, 3).setValue(contenu);
            if (image_url !== undefined && image_url !== null) articlesSheet.getRange(i + 1, 4).setValue(image_url);
            if (visible !== undefined && visible !== null) articlesSheet.getRange(i + 1, 7).setValue(visible === 'true' || visible === true);
            
            // Update modification date
            articlesSheet.getRange(i + 1, 6).setValue(now);
            
            // Add log
            var oldTitre = data[i][1];
            addAutomaticLog(`Article modifié: ${oldTitre}`, 'admin');
            
            found = true;
            break;
          }
        }
        
        result.success = found;
        if (!found) result.error = "Article non trouvé";
      }
    } else if (action == "deleteArticle") {
      // Supprimer un article
      var articlesSheet = ss.getSheetByName("Articles");
      var id = e.parameter.id;
      
      if (!articlesSheet) {
        result.success = false;
        result.error = "Feuille 'Articles' non trouvée";
      } else if (!id) {
        result.success = false;
        result.error = "ID de l'article manquant";
      } else {
        var data = articlesSheet.getDataRange().getValues();
        var found = false;
        var articleTitre = '';
        
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] == id) {
            articleTitre = data[i][1];
            articlesSheet.deleteRow(i + 1);
            found = true;
            break;
          }
        }
        
        // Add log
        if (found) {
          addAutomaticLog(`Article supprimé: ${articleTitre}`, 'admin');
        }
        
        result.success = found;
        if (!found) result.error = "Article non trouvé";
      }
    } else if (action == "getNewsStats") {
      // Récupérer les statistiques des articles
      var articlesSheet = ss.getSheetByName("Articles");
      if (!articlesSheet) {
        result.success = false;
        result.error = "Feuille 'Articles' non trouvée";
      } else {
        var data = articlesSheet.getDataRange().getValues();
        if (data.length <= 1) {
          result.success = true;
          result.stats = { totalArticles: 0, visibleArticles: 0 };
        } else {
          var totalArticles = 0;
          var visibleArticles = 0;
          
          for (var i = 1; i < data.length; i++) {
            totalArticles++;
            if (data[i][6] === true || data[i][6] === 'TRUE') {
              visibleArticles++;
            }
          }
          
          result.success = true;
          result.stats = {
            totalArticles: totalArticles,
            visibleArticles: visibleArticles
          };
        }
      }
      
    } else if (action == "trackVisitor") {
      // Enregistrer une nouvelle visite
      var visitorsSheet = ss.getSheetByName("visiteurs");
      if (!visitorsSheet) {
        result.success = false;
        result.error = "Feuille 'visiteurs' non trouvée";
      } else {
        // Date d'aujourd'hui au format DD/MM/YYYY
        var today = new Date();
        var day = String(today.getDate()).padStart(2, '0');
        var month = String(today.getMonth() + 1).padStart(2, '0');
        var year = today.getFullYear();
        var todayString = day + '/' + month + '/' + year;
        
        var data = visitorsSheet.getDataRange().getValues();
        var found = false;
        var rowIndex = -1;
        
        // Chercher si une entrée existe déjà pour aujourd'hui
        for (var i = 1; i < data.length; i++) {
          var rowDate = data[i][0];
          // Convertir la date en string si c'est un objet Date
          if (rowDate instanceof Date) {
            var rowDay = String(rowDate.getDate()).padStart(2, '0');
            var rowMonth = String(rowDate.getMonth() + 1).padStart(2, '0');
            var rowYear = rowDate.getFullYear();
            rowDate = rowDay + '/' + rowMonth + '/' + rowYear;
          }
          
          if (rowDate === todayString) {
            found = true;
            rowIndex = i;
            break;
          }
        }
        
        if (found) {
          // Incrémenter le compteur existant
          var currentCount = data[rowIndex][1] || 0;
          visitorsSheet.getRange(rowIndex + 1, 2).setValue(currentCount + 1);
          result.message = "Compteur de visiteurs incrémenté";
        } else {
          // Créer une nouvelle entrée pour aujourd'hui
          visitorsSheet.appendRow([todayString, 1]);
          result.message = "Nouvelle entrée visiteur créée";
        }
        
        // Ajouter un log automatique
        addAutomaticLog("Nouveau visiteur enregistré", "Page d'accueil");
        
        result.success = true;
      }
      
    } else if (action == "getVisitorStats") {
      // Récupérer les statistiques des visiteurs
      var visitorsSheet = ss.getSheetByName("visiteurs");
      if (!visitorsSheet) {
        result.success = false;
        result.error = "Feuille 'visiteurs' non trouvée";
      } else {
        var data = visitorsSheet.getDataRange().getValues();
        var totalVisitors = 0;
        var todayVisitors = 0;
        
        // Date d'aujourd'hui
        var today = new Date();
        var day = String(today.getDate()).padStart(2, '0');
        var month = String(today.getMonth() + 1).padStart(2, '0');
        var year = today.getFullYear();
        var todayString = day + '/' + month + '/' + year;
        
        // Calculer les statistiques
        for (var i = 1; i < data.length; i++) {
          var visitCount = data[i][1] || 0;
          totalVisitors += visitCount;
          
          // Vérifier si c'est aujourd'hui
          var rowDate = data[i][0];
          if (rowDate instanceof Date) {
            var rowDay = String(rowDate.getDate()).padStart(2, '0');
            var rowMonth = String(rowDate.getMonth() + 1).padStart(2, '0');
            var rowYear = rowDate.getFullYear();
            rowDate = rowDay + '/' + rowMonth + '/' + rowYear;
          }
          
          if (rowDate === todayString) {
            todayVisitors = visitCount;
          }
        }
        
        result.success = true;
        result.stats = {
          totalVisitors: totalVisitors,
          todayVisitors: todayVisitors,
          totalDays: data.length - 1, // Exclure l'en-tête
          dailyData: [] // Données par jour
        };
        
        // Ajouter les données par jour
        for (var i = 1; i < data.length; i++) {
          var rowDate = data[i][0];
          var visitCount = data[i][1] || 0;
          
          // Formater la date
          if (rowDate instanceof Date) {
            var day = String(rowDate.getDate()).padStart(2, '0');
            var month = String(rowDate.getMonth() + 1).padStart(2, '0');
            var year = rowDate.getFullYear();
            rowDate = day + '/' + month + '/' + year;
          }
          
          result.stats.dailyData.push({
            date: rowDate,
            visitors: visitCount
          });
        }
        
        // Trier par date (plus récent en premier)
        result.stats.dailyData.sort(function(a, b) {
          var dateA = new Date(a.date.split('/').reverse().join('-'));
          var dateB = new Date(b.date.split('/').reverse().join('-'));
          return dateB - dateA;
        });
      }
      
    } else if (action == "trackFAQClick") {
      // Enregistrer un clic sur une question FAQ
      var faqStatsSheet = ss.getSheetByName("FAQ_stats");
      var questionId = e.parameter.question_id;
      var questionText = e.parameter.question;
      
      if (!faqStatsSheet) {
        result.success = false;
        result.error = "Feuille 'FAQ_stats' non trouvée";
      } else if (!questionId || !questionText) {
        result.success = false;
        result.error = "ID de question et texte de question requis";
      } else {
        var data = faqStatsSheet.getDataRange().getValues();
        var found = false;
        var rowIndex = -1;
        
        // Chercher si la question existe déjà
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] === questionId) {
            found = true;
            rowIndex = i;
            break;
          }
        }
        
        if (found) {
          // Incrémenter le compteur de clics existant
          var currentClicks = data[rowIndex][2] || 0;
          faqStatsSheet.getRange(rowIndex + 1, 3).setValue(currentClicks + 1);
          result.message = "Compteur de clics incrémenté";
          result.clicks = currentClicks + 1;
        } else {
          // Créer une nouvelle entrée pour cette question
          faqStatsSheet.appendRow([questionId, questionText, 1]);
          result.message = "Nouvelle question ajoutée aux statistiques";
          result.clicks = 1;
        }
        
        // Ajouter un log automatique
        addAutomaticLog("Question FAQ cliquée: " + questionId, "Page FAQ");
        
        result.success = true;
        result.question_id = questionId;
      }
      
    } else if (action == "getFAQClickStats") {
      // Récupérer les statistiques de clics FAQ
      var faqStatsSheet = ss.getSheetByName("FAQ_stats");
      if (!faqStatsSheet) {
        result.success = false;
        result.error = "Feuille 'FAQ_stats' non trouvée";
      } else {
        var data = faqStatsSheet.getDataRange().getValues();
        var totalClicks = 0;
        var questionStats = [];
        
        // Calculer les statistiques
        for (var i = 1; i < data.length; i++) {
          var questionId = data[i][0];
          var questionText = data[i][1];
          var clicks = data[i][2] || 0;
          
          totalClicks += clicks;
          questionStats.push({
            question_id: questionId,
            question: questionText,
            clicks: clicks
          });
        }
        
        // Trier par nombre de clics (descendant)
        questionStats.sort(function(a, b) {
          return b.clicks - a.clicks;
        });
        
        result.success = true;
        result.stats = {
          totalClicks: totalClicks,
          totalQuestions: questionStats.length,
          questions: questionStats
        };
      }
      
    } else if (action == "trackPresentationClick") {
      // Enregistrer un clic sur une carte de présentation
      var presentationStatsSheet = ss.getSheetByName("Presentation_Stats");
      var cardName = e.parameter.card_nom;
      
      if (!presentationStatsSheet) {
        result.success = false;
        result.error = "Feuille 'Presentation_Stats' non trouvée";
      } else if (!cardName) {
        result.success = false;
        result.error = "Nom de la carte requis";
      } else {
        var data = presentationStatsSheet.getDataRange().getValues();
        var found = false;
        var rowIndex = -1;
        
        // Chercher si la carte existe déjà
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] === cardName) {
            found = true;
            rowIndex = i;
            break;
          }
        }
        
        if (found) {
          // Incrémenter le compteur de clics existant
          var currentClicks = data[rowIndex][1] || 0;
          presentationStatsSheet.getRange(rowIndex + 1, 2).setValue(currentClicks + 1);
          result.message = "Compteur de clics incrémenté";
          result.clicks = currentClicks + 1;
        } else {
          // Créer une nouvelle entrée pour cette carte
          presentationStatsSheet.appendRow([cardName, 1]);
          result.message = "Nouvelle carte ajoutée aux statistiques";
          result.clicks = 1;
        }
        
        // Ajouter un log automatique
        addAutomaticLog("Carte présentation cliquée: " + cardName, "Page présentation");
        
        result.success = true;
        result.card_nom = cardName;
      }
      
    } else if (action == "getPresentationClickStats") {
      // Récupérer les statistiques de clics présentation
      var presentationStatsSheet = ss.getSheetByName("Presentation_Stats");
      if (!presentationStatsSheet) {
        result.success = false;
        result.error = "Feuille 'Presentation_Stats' non trouvée";
      } else {
        var data = presentationStatsSheet.getDataRange().getValues();
        var totalClicks = 0;
        var cardStats = [];
        
        // Calculer les statistiques
        for (var i = 1; i < data.length; i++) {
          var cardName = data[i][0];
          var clicks = data[i][1] || 0;
          
          totalClicks += clicks;
          cardStats.push({
            card_nom: cardName,
            clicks: clicks
          });
        }
        
        // Trier par nombre de clics (descendant)
        cardStats.sort(function(a, b) {
          return b.clicks - a.clicks;
        });
        
        result.success = true;
        result.stats = {
          totalClicks: totalClicks,
          totalCards: cardStats.length,
          cards: cardStats
        };
      }
      
    } else if (action == "trackContactSubmission") {
      // Enregistrer un envoi de formulaire de contact
      var contactStatsSheet = ss.getSheetByName("Contact_Stats");
      if (!contactStatsSheet) {
        result.success = false;
        result.error = "Feuille 'Contact_Stats' non trouvée";
      } else {
        // Date d'aujourd'hui au format DD/MM/YYYY
        var today = new Date();
        var day = String(today.getDate()).padStart(2, '0');
        var month = String(today.getMonth() + 1).padStart(2, '0');
        var year = today.getFullYear();
        var todayString = day + '/' + month + '/' + year;
        
        var data = contactStatsSheet.getDataRange().getValues();
        var found = false;
        var rowIndex = -1;
        
        // Chercher si une entrée existe déjà pour aujourd'hui
        for (var i = 1; i < data.length; i++) {
          var rowDate = data[i][0];
          // Convertir la date en string si c'est un objet Date
          if (rowDate instanceof Date) {
            var rowDay = String(rowDate.getDate()).padStart(2, '0');
            var rowMonth = String(rowDate.getMonth() + 1).padStart(2, '0');
            var rowYear = rowDate.getFullYear();
            rowDate = rowDay + '/' + rowMonth + '/' + rowYear;
          }
          
          if (rowDate === todayString) {
            found = true;
            rowIndex = i;
            break;
          }
        }
        
        if (found) {
          // Incrémenter le compteur existant
          var currentCount = data[rowIndex][1] || 0;
          contactStatsSheet.getRange(rowIndex + 1, 2).setValue(currentCount + 1);
          result.message = "Compteur d'envois incrémenté";
          result.count = currentCount + 1;
        } else {
          // Créer une nouvelle entrée pour aujourd'hui
          contactStatsSheet.appendRow([todayString, 1]);
          result.message = "Nouvelle entrée d'envoi créée";
          result.count = 1;
        }
        
        // Ajouter un log automatique
        addAutomaticLog("Formulaire de contact envoyé", "Page contact");
        
        result.success = true;
      }
      
    } else if (action == "getContactStats") {
      // Récupérer les statistiques des envois de contact
      var contactStatsSheet = ss.getSheetByName("Contact_Stats");
      if (!contactStatsSheet) {
        result.success = false;
        result.error = "Feuille 'Contact_Stats' non trouvée";
      } else {
        var data = contactStatsSheet.getDataRange().getValues();
        var totalSubmissions = 0;
        var todaySubmissions = 0;
        
        // Date d'aujourd'hui
        var today = new Date();
        var day = String(today.getDate()).padStart(2, '0');
        var month = String(today.getMonth() + 1).padStart(2, '0');
        var year = today.getFullYear();
        var todayString = day + '/' + month + '/' + year;
        
        // Calculer les statistiques
        for (var i = 1; i < data.length; i++) {
          var submissionCount = data[i][1] || 0;
          totalSubmissions += submissionCount;
          
          // Vérifier si c'est aujourd'hui
          var rowDate = data[i][0];
          if (rowDate instanceof Date) {
            var rowDay = String(rowDate.getDate()).padStart(2, '0');
            var rowMonth = String(rowDate.getMonth() + 1).padStart(2, '0');
            var rowYear = rowDate.getFullYear();
            rowDate = rowDay + '/' + rowMonth + '/' + rowYear;
          }
          
          if (rowDate === todayString) {
            todaySubmissions = submissionCount;
          }
        }
        
        result.success = true;
        result.stats = {
          totalSubmissions: totalSubmissions,
          todaySubmissions: todaySubmissions,
          totalDays: data.length - 1, // Exclure l'en-tête
          dailyData: [] // Données par jour
        };
        
        // Ajouter les données par jour
        for (var i = 1; i < data.length; i++) {
          var rowDate = data[i][0];
          var submissionCount = data[i][1] || 0;
          
          // Formater la date
          if (rowDate instanceof Date) {
            var day = String(rowDate.getDate()).padStart(2, '0');
            var month = String(rowDate.getMonth() + 1).padStart(2, '0');
            var year = rowDate.getFullYear();
            rowDate = day + '/' + month + '/' + year;
          }
          
          result.stats.dailyData.push({
            date: rowDate,
            submissions: submissionCount
          });
        }
        
        // Trier par date (plus récent en premier)
        result.stats.dailyData.sort(function(a, b) {
          var dateA = new Date(a.date.split('/').reverse().join('-'));
          var dateB = new Date(b.date.split('/').reverse().join('-'));
          return dateB - dateA;
        });
      }
      
    } else if (action == "trackArticleClick") {
      // Enregistrer un clic sur un article
      var actusStatsSheet = ss.getSheetByName("Actus_Stats");
      var articleId = e.parameter.article_id;
      var articleTitle = e.parameter.titre;
      var timeSpent = parseInt(e.parameter.temps_cumule) || 0;
      
      if (!actusStatsSheet) {
        result.success = false;
        result.error = "Feuille 'Actus_Stats' non trouvée";
      } else if (!articleId || !articleTitle) {
        result.success = false;
        result.error = "ID d'article et titre requis";
      } else {
        var data = actusStatsSheet.getDataRange().getValues();
        var found = false;
        var rowIndex = -1;
        
        // Chercher si l'article existe déjà
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] === articleId) {
            found = true;
            rowIndex = i;
            break;
          }
        }
        
        if (found) {
          // Mettre à jour les données existantes
          var currentClicks = data[rowIndex][2] || 0;
          var currentTime = data[rowIndex][3] || 0;
          
          // Incrémenter les clics et ajouter le temps
          actusStatsSheet.getRange(rowIndex + 1, 3).setValue(currentClicks + 1);
          actusStatsSheet.getRange(rowIndex + 1, 4).setValue(currentTime + timeSpent);
          
          result.message = "Clic et temps enregistrés";
          result.clicks = currentClicks + 1;
          result.total_time = currentTime + timeSpent;
        } else {
          // Créer une nouvelle entrée pour cet article
          actusStatsSheet.appendRow([articleId, articleTitle, 1, timeSpent]);
          result.message = "Nouvel article ajouté aux statistiques";
          result.clicks = 1;
          result.total_time = timeSpent;
        }
        
        // Ajouter un log automatique
        addAutomaticLog("Article lu: " + articleTitle + " (temps: " + timeSpent + "s)", "Page actualités");
        
        result.success = true;
        result.article_id = articleId;
      }
      
    } else if (action == "getArticleStats") {
      // Récupérer les statistiques des articles
      var actusStatsSheet = ss.getSheetByName("Actus_Stats");
      if (!actusStatsSheet) {
        result.success = false;
        result.error = "Feuille 'Actus_Stats' non trouvée";
      } else {
        var data = actusStatsSheet.getDataRange().getValues();
        var totalClicks = 0;
        var totalTime = 0;
        var articleStats = [];
        
        // Calculer les statistiques
        for (var i = 1; i < data.length; i++) {
          var articleId = data[i][0];
          var articleTitle = data[i][1];
          var clicks = data[i][2] || 0;
          var timeSpent = data[i][3] || 0;
          
          totalClicks += clicks;
          totalTime += timeSpent;
          
          // Calculer le temps moyen par article
          var avgTimePerView = clicks > 0 ? Math.round(timeSpent / clicks) : 0;
          
          articleStats.push({
            article_id: articleId,
            titre: articleTitle,
            clics: clicks,
            temps_cumule: timeSpent,
            temps_moyen: avgTimePerView
          });
        }
        
        // Trier par nombre de clics (descendant)
        articleStats.sort(function(a, b) {
          return b.clics - a.clics;
        });
        
        result.success = true;
        result.stats = {
          totalClicks: totalClicks,
          totalTime: totalTime,
          totalArticles: articleStats.length,
          averageTime: totalClicks > 0 ? Math.round(totalTime / totalClicks) : 0,
          articles: articleStats
        };
      }
    } else {
      // Action par défaut pour la compatibilité avec l'ancien système
      if (e.parameter.name && e.parameter.email && e.parameter.message) {
        var sheet = ss.getSheetByName(SHEET_NAME);
        var name = e.parameter.name;
        var email = e.parameter.email;
        var phone = e.parameter.phone || "Non renseigné";
        var message = e.parameter.message;
        
        if (!isValidEmail(email)) {
          result.success = false;
          result.error = "Format d'email invalide";
        } else {
          var data = sheet.getDataRange().getValues();
          var newId = 1;
          if (data.length > 1) {
            var ids = data.slice(1).map(function (row) {
              return parseInt(row[0].toString().replace('MSG_', '').split('_')[0]) || 0;
            });
            newId = Math.max.apply(null, ids) + 1;
          }
          
          var uniqueId = "MSG_" + new Date().getTime() + "_" + newId;
          var currentDate = new Date();
          sheet.appendRow([uniqueId, name, email, phone, message, false, currentDate]);
          
          result.success = true;
          result.message = "Message enregistré avec succès";
          result.id = uniqueId;
        }
      } else {
        result.error = "Action non reconnue ou paramètres manquants";
      }
    }
    
  } catch (err) {
    result.error = err.toString();
  }

  var output = JSON.stringify(result);
  if (e.parameter.callback) {
    output = e.parameter.callback + "(" + output + ")";
    return ContentService.createTextOutput(output).setMimeType(
      ContentService.MimeType.JAVASCRIPT
    );
  }
  return ContentService.createTextOutput(output).setMimeType(
    ContentService.MimeType.JSON
  );
}

/**
 * Fonction utilitaire pour ajouter un log automatique
 */
function addAutomaticLog(action, source) {
  try {
    var ss = SpreadsheetApp.openById("13VM6PrfwLKlxsmCQkcMQvDuzviBI2xd5C7SR-3GeqVc");
    var logsSheet = ss.getSheetByName("LOGS");
    
    if (logsSheet) {
      var now = new Date();
      var day = String(now.getDate()).padStart(2, '0');
      var month = String(now.getMonth() + 1).padStart(2, '0');
      var year = now.getFullYear();
      var date = day + '/' + month + '/' + year;
      var hours = String(now.getHours()).padStart(2, '0');
      var minutes = String(now.getMinutes()).padStart(2, '0');
      var seconds = String(now.getSeconds()).padStart(2, '0');
      var heure = hours + 'h' + minutes + 'm' + seconds + 's';
      
      var logData = logsSheet.getDataRange().getValues();
      var logId = logData.length;
      logsSheet.appendRow([logId, date, heure, action, source || 'Admin Panel']);
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout du log automatique:', error);
  }
}

/**
 * Valide le format d'un email
 */
function isValidEmail(email) {
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Fonction de test pour vérifier la configuration
 */
function testConfiguration() {
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!spreadsheet) {
      console.log("❌ Spreadsheet non trouvé");
      return false;
    }
    
    if (!sheet) {
      console.log("❌ Feuille 'Messages' non trouvée");
      return false;
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length === 0) {
      console.log("❌ Feuille 'Messages' vide");
      return false;
    }
    
    var headers = data[0];
    var expectedHeaders = ["ID", "NAME", "EMAIL", "PHONE", "MESSAGE", "READ", "DATE"];
    var headersMatch = expectedHeaders.every(function(header, index) {
      return headers[index] === header;
    });
    
    if (!headersMatch) {
      console.log("❌ Les en-têtes ne correspondent pas aux colonnes attendues");
      console.log("Attendu:", expectedHeaders);
      console.log("Trouvé:", headers);
      return false;
    }
    
    console.log("✅ Configuration correcte");
    console.log("Spreadsheet: CandorMission");
    console.log("Feuille: Messages");
    console.log("Colonnes:", headers);
    console.log("Nombre de messages:", data.length - 1);
    
    return true;
    
  } catch (error) {
    console.error("❌ Erreur lors du test de configuration:", error);
    return false;
  }
}

// Instructions d'utilisation:
// 1. Copier ce code dans l'éditeur Google Apps Script
// 2. S'assurer que le script est lié au spreadsheet "CandorMission"
// 3. Déployer comme application web
// 4. Autoriser l'accès au Google Sheet
// 5. Utiliser l'URL de déploiement avec des paramètres GET:
//
// Actions disponibles:
// - addMessage: ?action=addMessage&name=Nom&email=email@example.com&phone=0123456789&message=Message
// - readMessages: ?action=readMessages
// - markAsRead: ?action=markAsRead&id=MSG_1234567890_1
// - deleteMessage: ?action=deleteMessage&id=MSG_1234567890_1
// - archiveMessage: ?action=archiveMessage&id=MSG_1234567890_1
// - getUnreadCount: ?action=getUnreadCount
// - testConfiguration: ?action=testConfiguration
// - cleanupOldMessages: ?action=cleanupOldMessages
// - getStats: ?action=getStats
// - readArchives: ?action=readArchives
// - restoreMessage: ?action=restoreMessage&id=MSG_1234567890_1
// - deleteArchivedMessage: ?action=deleteArchivedMessage&id=MSG_1234567890_1
// - readLogs: ?action=readLogs
// - addLog: ?action=addLog&ip=IP_ADDRESS
// - exportLogs: ?action=exportLogs
// - trackVisitor: ?action=trackVisitor
// - getVisitorStats: ?action=getVisitorStats
// - trackFAQClick: ?action=trackFAQClick&question_id=FAQ_1&question=Question%20text
// - getFAQClickStats: ?action=getFAQClickStats
// - trackPresentationClick: ?action=trackPresentationClick&card_nom=BOSS
// - getPresentationClickStats: ?action=getPresentationClickStats
// - trackContactSubmission: ?action=trackContactSubmission
// - getContactStats: ?action=getContactStats
// - trackArticleClick: ?action=trackArticleClick&article_id=ART_123&titre=Mon%20Article&temps_cumule=45
// - getArticleStats: ?action=getArticleStats
//
// Compatibilité: L'ancien format sans action fonctionne toujours
// ?name=Nom&email=email@example.com&phone=0123456789&message=Message
//
// IMPORTANT: Si le script n'est pas lié au spreadsheet, remplacer la ligne :
// var ss = SpreadsheetApp.getActiveSpreadsheet();
// par :
// var ss = SpreadsheetApp.openById("VOTRE_SPREADSHEET_ID_ICI");
