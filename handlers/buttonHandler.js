/**
 * Handler: Boutons
 * Chargement automatique des boutons interactifs
 */

const fs = require('fs');
const path = require('path');
const Logger = require('../utils/logger');

class ButtonHandler {
    constructor(client) {
        this.client = client;
        this.buttons = new Map();
        this.cooldowns = new Map();
    }

    /**
     * Charge tous les boutons
     */
    async loadButtons() {
        const buttonsPath = path.join(__dirname, '..', 'buttons');
        const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));

        for (const file of buttonFiles) {
            const filePath = path.join(buttonsPath, file);
            const button = require(filePath);

            if (button.customId && button.execute) {
                this.buttons.set(button.customId, button);
                Logger.info(`Bouton chargé: ${button.customId}`);
            } else {
                Logger.warn(`Bouton ${file} invalide`);
            }
        }
    }

    /**
     * Exécute un bouton
     */
    async executeButton(interaction) {
        let button = this.buttons.get(interaction.customId);

        // Match prefix pour les IDs dynamiques (ex: absence_approve_123)
        if (!button) {
            for (const [key, btn] of this.buttons.entries()) {
                if (interaction.customId.startsWith(key) && key.length > 0) {
                    button = btn;
                    break;
                }
            }
        }

        if (!button) return;

        // Vérifier le cooldown
        if (this.isOnCooldown(interaction.user.id, interaction.customId)) {
            return interaction.reply({
                content: '⏳ Veuillez patienter avant d\'utiliser ce bouton à nouveau.',
                ephemeral: true
            });
        }

        // Appliquer le cooldown
        this.setCooldown(interaction.user.id, interaction.customId);

        try {
            await button.execute(interaction, this.client);
        } catch (error) {
            Logger.error(`Erreur dans le bouton ${interaction.customId}`, error);
            
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

    isOnCooldown(userId, buttonId) {
        const key = `${userId}_${buttonId}`;
        const cooldown = this.cooldowns.get(key);
        if (!cooldown) return false;
        if (Date.now() < cooldown) return true;
        this.cooldowns.delete(key);
        return false;
    }

    setCooldown(userId, buttonId) {
        const key = `${userId}_${buttonId}`;
        const cooldownDuration = (this.client.config?.buttonCooldown || 3) * 1000;
        this.cooldowns.set(key, Date.now() + cooldownDuration);
    }
}

module.exports = ButtonHandler;
