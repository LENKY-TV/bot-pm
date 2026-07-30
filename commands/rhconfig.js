/**
 * Commande: /rhconfig
 * Panneau de configuration interactif
 */

const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const ConfigModel = require('../models/Config');
const ServiceModel = require('../models/Service');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rhconfig')
        .setDescription('Configuration du système RH')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        // Initialiser la config si nécessaire
        ConfigModel.initDefaults(guildId);
        ServiceModel.initDefaults(guildId);

        const config = ConfigModel.getAll(guildId);

        const embed = EmbedUtils.create(guildId, {
            title: '⚙️ Configuration RH - Police Municipale',
            description: 'Utilisez les menus et boutons ci-dessous pour configurer le système.',
            fields: [
                {
                    name: '🎨 Apparence',
                    value: [
                        `**Couleur:** \`${config.embed_color || '#1E3A5F'}\``,
                        `**Titre:** \`${config.embed_title || 'Non défini'}\``,
                        `**Footer:** \`${config.embed_footer || 'Non défini'}\``,
                        `**Image:** ${config.embed_image ? '✅ Configurée' : '❌ Non définie'}`,
                        `**Thumbnail:** ${config.embed_thumbnail ? '✅ Configurée' : '❌ Non définie'}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '📋 Salons',
                    value: [
                        `**Logs:** ${config.log_channel ? `<#${config.log_channel}>` : '❌ Non défini'}`,
                        `**Transcripts:** ${config.transcript_channel ? `<#${config.transcript_channel}>` : '❌ Non défini'}`,
                        `**Catégorie:** ${config.ticket_category ? `<#${config.ticket_category}>` : '❌ Non défini'}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '⏰ Relances',
                    value: [
                        `**Intervalle:** \`${config.reminder_interval || 24}h\``,
                        `**Max relances:** \`${config.reminder_max || 3}\``
                    ].join('\n'),
                    inline: true
                }
            ]
        });

        // Menu de sélection principal
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('rhconfig_main')
            .setPlaceholder('Sélectionnez une catégorie à configurer')
            .addOptions([
                {
                    label: '🎨 Apparence',
                    description: 'Modifier couleur, titre, footer, image',
                    value: 'appearance'
                },
                {
                    label: '📋 Salons',
                    description: 'Configurer les salons de logs et transcripts',
                    value: 'channels'
                },
                {
                    label: '🏷️ Services',
                    description: 'Gérer les services disponibles',
                    value: 'services'
                },
                {
                    label: '⏰ Relances',
                    description: 'Configurer les relances automatiques',
                    value: 'reminders'
                },
                {
                    label: '💬 Messages',
                    description: 'Modifier les messages automatiques',
                    value: 'messages'
                },
                {
                    label: '📊 Dashboard',
                    description: 'Configurer le tableau de bord',
                    value: 'dashboard'
                }
            ]);

        const row1 = new ActionRowBuilder().addComponents(selectMenu);

        // Boutons d'action rapide
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('rhconfig_reset')
                .setLabel('Réinitialiser')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔄'),
            new ButtonBuilder()
                .setCustomId('rhconfig_export')
                .setLabel('Exporter')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📤'),
            new ButtonBuilder()
                .setCustomId('rhconfig_info')
                .setLabel('Informations')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('ℹ️')
        );

        await interaction.reply({ embeds: [embed], components: [row1, row2], ephemeral: true });
    }
};
