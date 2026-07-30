/**
 * Handler: Select Menus
 * Chargement automatique des menus de sélection
 */

const fs = require('fs');
const path = require('path');
const Logger = require('../utils/logger');

class SelectMenuHandler {
    constructor(client) {
        this.client = client;
        this.menus = new Map();
    }

    /**
     * Charge tous les select menus
     */
    async loadMenus() {
        const menusPath = path.join(__dirname, '..', 'selectMenus');
        const menuFiles = fs.readdirSync(menusPath).filter(file => file.endsWith('.js'));

        for (const file of menuFiles) {
            const filePath = path.join(menusPath, file);
            const menu = require(filePath);

            if (menu.customId && menu.execute) {
                this.menus.set(menu.customId, menu);
                Logger.info(`Select Menu chargé: ${menu.customId}`);
            } else {
                Logger.warn(`Select Menu ${file} invalide`);
            }
        }
    }

    /**
     * Exécute un select menu
     */
    async executeMenu(interaction) {
        const menu = this.menus.get(interaction.customId);
        if (!menu) return;

        try {
            await menu.execute(interaction, this.client);
        } catch (error) {
            Logger.error(`Erreur dans le menu ${interaction.customId}`, error);
            
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

module.exports = SelectMenuHandler;
