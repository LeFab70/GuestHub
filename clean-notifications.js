#!/usr/bin/env node

/**
 * Script pour nettoyer les notifications des badges déjà imprimés
 * Ce script peut être exécuté périodiquement pour maintenir la propreté des notifications
 */

const fs = require('fs');
const path = require('path');

// Chemin vers le fichier de notifications (simulation du localStorage)
const notificationsPath = path.join(__dirname, 'notifications.json');

function cleanPrintedBadgeNotifications() {
    console.log('🧹 Nettoyage des notifications des badges imprimés...');
    
    try {
        // Lire les notifications actuelles
        let notifications = [];
        if (fs.existsSync(notificationsPath)) {
            const data = fs.readFileSync(notificationsPath, 'utf8');
            notifications = JSON.parse(data);
        }
        
        console.log(`📊 Notifications avant nettoyage: ${notifications.length}`);
        
        // Filtrer les notifications des badges imprimés
        const cleanedNotifications = notifications.filter(notification => {
            // Garder seulement les notifications qui ne sont pas liées à des badges
            // ou qui sont des notifications d'expiration
            return !(notification.type === 'visit_created' && notification.data?.badgeId);
        });
        
        console.log(`📊 Notifications après nettoyage: ${cleanedNotifications.length}`);
        console.log(`🗑️ Notifications supprimées: ${notifications.length - cleanedNotifications.length}`);
        
        // Sauvegarder les notifications nettoyées
        fs.writeFileSync(notificationsPath, JSON.stringify(cleanedNotifications, null, 2));
        
        console.log('✅ Nettoyage terminé avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors du nettoyage:', error);
    }
}

// Exécuter le nettoyage
cleanPrintedBadgeNotifications();

