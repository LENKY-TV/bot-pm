/**
 * Commande: /rhdeploy
 * Déploiement du panneau de ticket
 */

const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ServiceModel = require('../models/Service');
const ConfigModel = require('../models/Config');
const EmbedUtils = require('../utils/embedBuilder');
const { run, get } = require('../config/database');
const Logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rhdeploy')
        .setDescription('Déployer le panneau de ticket')
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Salon où déployer le panneau')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        const guild = interaction.guild;
        const guildId = guild.id;
        const channel = interaction.options.getChannel('salon');

        const botPerms = channel.permissionsFor(guild.members.me);
        if (!botPerms.has('SendMessages') || !botPerms.has('EmbedLinks')) {
            return interaction.reply({
                content: '❌ Je n\'ai pas les permissions nécessaires dans ce salon.',
                ephemeral: true
            });
        }

        const services = ServiceModel.getAll(guildId);
        if (services.length === 0) {
            return interaction.reply({
                content: '❌ Aucun service configuré. Utilisez `/rhconfig` pour en configurer.',
                ephemeral: true
            });
        }

        ConfigModel.initDefaults(guildId);

        const embed = EmbedUtils.deploy(guildId);

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_service_select')
            .setPlaceholder('Sélectionnez un service')
            .setMinValues(1)
            .setMaxValues(1);

        services.forEach(service => {
            selectMenu.addOptions({
                label: `${service.emoji} ${service.name}`,
                description: service.description || `Créer un ticket ${service.name}`,
                value: service.name,
                emoji: service.emoji
            });
        });

        const row1 = new ActionRowBuilder().addComponents(selectMenu);

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_claim_all')
                .setLabel('Revendiquer')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📋'),
            new ButtonBuilder()
                .setCustomId('ticket_stats')
                .setLabel('Statistiques')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📊'),
            new ButtonBuilder()
                .setCustomId('ticket_close_all')
                .setLabel('Tout fermer')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒')
        );

        try {
            const message = await channel.send({
                embeds: [embed],
                components: [row1, row2]
            });

            const existing = get('SELECT * FROM dashboard WHERE guild_id = ?', [guildId]);
            if (existing) {
                run('UPDATE dashboard SET channel_id = ?, message_id = ?, last_update = datetime("now") WHERE guild_id = ?', [channel.id, message.id, guildId]);
            } else {
                run('INSERT INTO dashboard (guild_id, channel_id, message_id) VALUES (?, ?, ?)', [guildId, channel.id, message.id]);
            }

            Logger.info(`Panneau déployé dans #${channel.name} par ${interaction.user.tag}`);

            await interaction.reply({
                content: `✅ Panneau déployé avec succès dans ${channel} !`,
                ephemeral: true
            });
        } catch (error) {
            Logger.error('Erreur lors du déploiement', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue lors du déploiement.',
                ephemeral: true
            });
        }
    }
};
