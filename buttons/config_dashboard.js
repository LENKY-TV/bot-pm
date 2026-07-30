/**
 * Button: config_dashboard
 * Déploie le tableau de bord
 */

const { ChannelType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ConfigModel = require('../models/Config');
const EmbedUtils = require('../utils/embedBuilder');
const { run, get } = require('../config/database');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_dashboard',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: '❌ Vous n\'avez pas les permissions nécessaires.',
                ephemeral: true
            });
        }

        const embed = EmbedUtils.deploy(guildId);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('dashboard_stats')
                .setLabel('Statistiques')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📊'),
            new ButtonBuilder()
                .setCustomId('dashboard_agents')
                .setLabel('Agents')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('👥'),
            new ButtonBuilder()
                .setCustomId('dashboard_tickets')
                .setLabel('Tickets')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🎫')
        );

        const existingDashboard = get('SELECT * FROM dashboard WHERE guild_id = ?', [guildId]);
        if (existingDashboard) {
            run('UPDATE dashboard SET last_update = datetime("now") WHERE guild_id = ?', [guildId]);
        } else {
            run('INSERT INTO dashboard (guild_id, last_update) VALUES (?, datetime("now"))', [guildId]);
        }

        Logger.info(`Dashboard déployé par ${interaction.user.tag}`);

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};
