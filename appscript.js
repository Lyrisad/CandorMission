// Google Apps Script pour Candor Ma Mission
// Fichier à copier-coller dans l'éditeur Google Apps Script

// Configuration
const SPREADSHEET_NAME = "CandorMission";
const SHEET_NAME = "Messages";
const COLUMNS = ["ID", "NAME", "EMAIL", "PHONE", "MESSAGE", "READ", "DATE"];

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
        addAutomaticLog("Nouveau message reçu", "Contact Form");
        
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
      
      // Ajouter un log automatique
      if (found) {
        addAutomaticLog("Message supprimé", "Admin Panel");
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
        
        // Ajouter un log automatique
        if (found) {
          addAutomaticLog("Message archivé", "Admin Panel");
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
        
        // Ajouter un log automatique
        if (found) {
          addAutomaticLog("Message restauré", "Admin Panel");
        }
        
        result.success = found;
        if (!found) result.error = "Message archivé non trouvé";
      }
      
    } else if (action == "deleteArchivedMessage") {
      // Suppression définitive d'un message archivé
      var archiveSheet = ss.getSheetByName("MessagesArchive");
      var messageId = e.parameter.id;
      
      if (!archiveSheet) {
        result.success = false;
        result.error = "Feuille 'MessagesArchive' non trouvée";
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
        
        // Ajouter un log automatique
        if (found) {
          addAutomaticLog("Message supprimé définitivement", "Admin Panel");
        }
        
        result.success = found;
        if (!found) result.error = "Message archivé non trouvé";
      }
      
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
      var action = e.parameter.action;
      var ip = e.parameter.ip || "N/A";
      
      if (!logsSheet) {
        result.success = false;
        result.error = "Feuille 'LOGS' non trouvée";
      } else if (!action) {
        result.success = false;
        result.error = "Action manquante";
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
        
        // Formatage manuel de l'heure (HH:MM:SS)
        var hours = String(now.getHours()).padStart(2, '0');
        var minutes = String(now.getMinutes()).padStart(2, '0');
        var seconds = String(now.getSeconds()).padStart(2, '0');
        var heure = hours + ':' + minutes + ':' + seconds;
        
        // Rendre l'action plus descriptive
        var descriptiveAction = action;
        if (action === 'addLog') {
          descriptiveAction = 'Test de log';
        } else if (action.includes('archiv')) {
          descriptiveAction = 'Message archivé';
        } else if (action.includes('supprim')) {
          descriptiveAction = 'Message supprimé';
        } else if (action.includes('restaur')) {
          descriptiveAction = 'Message restauré';
        } else if (action.includes('connexion')) {
          descriptiveAction = 'Connexion admin';
        } else if (action.includes('déconnexion')) {
          descriptiveAction = 'Déconnexion admin';
        }
        
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
      var heure = hours + ':' + minutes + ':' + seconds;
      
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
//
// Compatibilité: L'ancien format sans action fonctionne toujours
// ?name=Nom&email=email@example.com&phone=0123456789&message=Message
//
// IMPORTANT: Si le script n'est pas lié au spreadsheet, remplacer la ligne :
// var ss = SpreadsheetApp.getActiveSpreadsheet();
// par :
// var ss = SpreadsheetApp.openById("VOTRE_SPREADSHEET_ID_ICI");
