/**
 * Handler: Commandes
 * Chargement automatique des slash commands
 */

const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const config = require('../config/config');
const Logger = require('../utils/logger');

class CommandHandler {
    constructor(client) {
        this.client = client;
        this.commands = new Map();
        this.cooldowns = new Map();
    }

    /**
     * Charge toutes les commandes
     */
    async loadCommands() {
        const commandsPath = path.join(__dirname, '..', 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        const commands = [];

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            if ('data' in command && 'execute' in command) {
                this.commands.set(command.data.name, command);
                commands.push(command.data.toJSON());
                Logger.info(`Commande chargée: /${command.data.name}`);
            } else {
                Logger.warn(`Commande ${file} invalide - manque data ou execute`);
            }
        }

        // Déployer les commandes
        await this.deployCommands(commands);
    }

    /**
     * Déploie les commandes sur Discord
     */
    async deployCommands(commands) {
        const rest = new REST({ version: '10' }).setToken(config.token);

        try {
            Logger.info(`Déploiement de ${commands.length} commandes...`);

            await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: commands }
            );

            Logger.info(`${commands.length} commandes déployées avec succès`);
        } catch (error) {
            Logger.error('Erreur lors du déploiement des commandes', error);
        }
    }

    /**
     * Exécute une commande
     */
    async executeCommand(interaction) {
        const command = this.commands.get(interaction.commandName);
        if (!command) return;

        // Vérifier le cooldown
        if (this.isOnCooldown(interaction.user.id, command.data.name)) {
            return interaction.reply({
                content: '⏳ Veuillez patienter avant d\'utiliser cette commande à nouveau.',
                ephemeral: true
            });
        }

        // Appliquer le cooldown
        this.setCooldown(interaction.user.id, command.data.name);

        try {
            await command.execute(interaction, this.client);
        } catch (error) {
            Logger.error(`Erreur dans la commande /${command.data.name}`, error);
            
            const reply = {
                content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
                ephemeral: true
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    }

    /**
     * Vérifie si un utilisateur est en cooldown
     */
    isOnCooldown(userId, commandName) {
        const key = `${userId}_${commandName}`;
        const cooldown = this.cooldowns.get(key);
        if (!cooldown) return false;

        if (Date.now() < cooldown) {
            return true;
        }

        this.cooldowns.delete(key);
        return false;
    }

    /**
     * Définit un cooldown
     */
    setCooldown(userId, commandName) {
        const key = `${userId}_${commandName}`;
        const cooldownDuration = (config.commandCooldown || 5) * 1000;
        this.cooldowns.set(key, Date.now() + cooldownDuration);
    }
}

module.exports = CommandHandler;
