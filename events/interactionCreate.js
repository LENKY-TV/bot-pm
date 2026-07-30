/**
 * Event: interactionCreate
 * Gestion des interactions (commandes, boutons, menus, modales)
 */

const { Events } = require('discord.js');
const Logger = require('../utils/logger');

module.exports = {
    name: Events.InteractionCreate,
    once: false,

    async execute(interaction, client) {
        // Gérer les slash commands
        if (interaction.isChatInputCommand()) {
            await client.commandHandler.executeCommand(interaction);
            return;
        }

        // Gérer les boutons
        if (interaction.isButton()) {
            await client.buttonHandler.executeButton(interaction);
            return;
        }

        // Gérer les select menus
        if (interaction.isStringSelectMenu()) {
            await client.selectMenuHandler.executeMenu(interaction);
            return;
        }

        // Gérer les modales
        if (interaction.isModalSubmit()) {
            await client.modalHandler.executeModal(interaction);
            return;
        }

        // Gérer les menus de contexte
        if (interaction.isUserContextMenuCommand()) {
            Logger.debug(`Menu de contexte: ${interaction.commandName}`);
            return;
        }
    }
};
