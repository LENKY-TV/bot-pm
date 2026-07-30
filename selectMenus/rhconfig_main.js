/**
 * Select Menu: rhconfig_main
 * Menu principal de configuration
 */

const { ActionRowBuilder, ChannelType, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const ConfigModel = require('../models/Config');
const ServiceModel = require('../models/Service');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'rhconfig_main',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const category = interaction.values[0];

        const config = ConfigModel.getAll(guildId);

        switch (category) {
            case 'appearance':
                return this.handleAppearance(interaction, client, config);
            case 'channels':
                return this.handleChannels(interaction, client, config);
            case 'services':
                return this.handleServices(interaction, client, guildId);
            case 'reminders':
                return this.handleReminders(interaction, client, config);
            case 'messages':
                return this.handleMessages(interaction, client, config);
            case 'dashboard':
                return this.handleDashboard(interaction, client, config);
        }
    },

    async handleAppearance(interaction, client, config) {
        const embed = EmbedUtils.create(interaction.guild.id, {
            title: '🎨 Configuration de l\'apparence',
            fields: [
                { name: 'Couleur actuelle', value: `\`${config.embed_color || '#1E3A5F'}\``, inline: true },
                { name: 'Titre actuel', value: `\`${config.embed_title || 'Non défini'}\``, inline: true },
                { name: 'Footer actuel', value: `\`${config.embed_footer || 'Non défini'}\``, inline: true }
            ]
        });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('config_color')
                .setLabel('Couleur')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎨'),
            new ButtonBuilder()
                .setCustomId('config_title')
                .setLabel('Titre')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📝'),
            new ButtonBuilder()
                .setCustomId('config_footer')
                .setLabel('Footer')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📝'),
            new ButtonBuilder()
                .setCustomId('config_image')
                .setLabel('Image')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🖼️'),
            new ButtonBuilder()
                .setCustomId('config_thumbnail')
                .setLabel('Thumbnail')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🖼️')
        );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    },

    async handleChannels(interaction, client, config) {
        const embed = EmbedUtils.create(interaction.guild.id, {
            title: '📋 Configuration des salons',
            fields: [
                { name: 'Logs', value: config.log_channel ? `<#${config.log_channel}>` : '❌ Non défini', inline: true },
                { name: 'Transcripts', value: config.transcript_channel ? `<#${config.transcript_channel}>` : '❌ Non défini', inline: true },
                { name: 'Catégorie', value: config.ticket_category ? `<#${config.ticket_category}>` : '❌ Non définie', inline: true }
            ]
        });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('config_log_channel')
                .setLabel('Salon des logs')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📋'),
            new ButtonBuilder()
                .setCustomId('config_transcript_channel')
                .setLabel('Salon des transcripts')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📋'),
            new ButtonBuilder()
                .setCustomId('config_ticket_category')
                .setLabel('Catégorie des tickets')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📁')
        );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    },

    async handleServices(interaction, client, guildId) {
        const services = ServiceModel.getAll(guildId);

        const embed = EmbedUtils.create(interaction.guild.id, {
            title: '🏷️ Gestion des services',
            description: `${services.length} service(s) configuré(s)`,
            fields: services.slice(0, 25).map(s => ({
                name: `${s.emoji} ${s.name}`,
                value: `Rôle: ${s.role_id ? `<@&${s.role_id}>` : '❌'}`,
                inline: true
            }))
        });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('rhconfig_service_edit')
            .setPlaceholder('Sélectionnez un service à modifier')
            .addOptions(services.map(s => ({
                label: `${s.emoji} ${s.name}`,
                value: s.name
            })));

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    },

    async handleReminders(interaction, client, config) {
        const embed = EmbedUtils.create(interaction.guild.id, {
            title: '⏰ Configuration des relances',
            fields: [
                { name: 'Intervalle', value: `\`${config.reminder_interval || 24}h\``, inline: true },
                { name: 'Max relances', value: `\`${config.reminder_max || 3}\``, inline: true }
            ]
        });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('config_reminder_interval')
                .setLabel('Intervalle')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⏰'),
            new ButtonBuilder()
                .setCustomId('config_reminder_max')
                .setLabel('Max relances')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🔢')
        );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    },

    async handleMessages(interaction, client, config) {
        const embed = EmbedUtils.create(interaction.guild.id, {
            title: '💬 Configuration des messages',
            fields: [
                { name: 'Message de bienvenue', value: config.welcome_message || 'Non défini', inline: false },
                { name: 'Message de fermeture', value: config.close_message || 'Non défini', inline: false }
            ]
        });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('config_welcome_message')
                .setLabel('Message de bienvenue')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('💬'),
            new ButtonBuilder()
                .setCustomId('config_close_message')
                .setLabel('Message de fermeture')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('💬')
        );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    },

    async handleDashboard(interaction, client, config) {
        const embed = EmbedUtils.create(interaction.guild.id, {
            title: '📊 Configuration du Dashboard',
            fields: [
                { name: 'Évaluations', value: config.rating_enabled === '1' ? '✅ Activées' : '❌ Désactivées', inline: true }
            ]
        });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('config_dashboard')
                .setLabel('Déployer le dashboard')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📊'),
            new ButtonBuilder()
                .setCustomId('config_rating_toggle')
                .setLabel('Activer/Désactiver les évaluations')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⭐')
        );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};
