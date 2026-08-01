/**
 * Handler: Modals
 * Chargement automatique des modales
 */

const fs = require('fs');
const path = require('path');
const Logger = require('../utils/logger');

class ModalHandler {
    constructor(client) {
        this.client = client;
        this.modals = new Map();
    }

    /**
     * Charge toutes les modales
     */
    async loadModals() {
        const modalsPath = path.join(__dirname, '..', 'modals');
        const modalFiles = fs.readdirSync(modalsPath).filter(file => file.endsWith('.js'));

        for (const file of modalFiles) {
            const filePath = path.join(modalsPath, file);
            const modal = require(filePath);

            if (modal.customId && modal.execute) {
                this.modals.set(modal.customId, modal);
                Logger.info(`Modale chargée: ${modal.customId}`);
            } else {
                Logger.warn(`Modale ${file} invalide`);
            }
        }
    }

    /**
     * Exécute une modale
     */
    async executeModal(interaction) {
        let modal = this.modals.get(interaction.customId);
        
        // Si pas trouvé, chercher par prefix (pour les customIds dynamiques)
        if (!modal) {
            for (const [key, value] of this.modals) {
                if (interaction.customId.startsWith(key)) {
                    modal = value;
                    break;
                }
            }
        }

        if (!modal) return;

        try {
            await modal.execute(interaction, this.client);
        } catch (error) {
            Logger.error(`Erreur dans la modale ${interaction.customId}`, error);
            
            const reply = {
                content: '❌ Une erreur est survenue.',
                ephemeral: true
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    }
}

module.exports = ModalHandler;
