/**
 * Commande: /dashboard
 * Tableau de bord RH
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const TicketModel = require('../models/Ticket');
const StaffModel = require('../models/Staff');
const EmbedUtils = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dashboard')
        .setDescription('Tableau de bord RH')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        await interaction.deferReply();

        const stats = TicketModel.getStats(guildId);
        const topStaff = TicketModel.getTopStaff(guildId, 5);
        const onlineAgents = StaffModel.getOnline(guildId);

        const embed = EmbedUtils.create(guildId, {
            title: '📊 Tableau de Bord RH - Police Municipale',
            fields: [
                {
                    name: '🎫 Tickets',
                    value: [
                        `**Ouverts:** \`${stats.open}\``,
                        `**Fermés:** \`${stats.closed}\``,
                        `**Aujourd'hui:** \`${stats.today}\``,
                        `**Cette semaine:** \`${stats.thisWeek}\``
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '👥 Agents',
                    value: [
                        `**En ligne:** \`${onlineAgents.length}\``,
                        `**Total gérés:** \`${stats.totalClaims}\``
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '⏱️ Performance',
                    value: [
                        `**Réponse moy.:** \`${Math.round(stats.avgResponseTime)} min\``,
                        `**Résolution moy.:** \`${Math.round(stats.avgResolutionTime)} min\``
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '📈 Messages',
                    value: `\`${stats.totalMessages}\` messages au total`,
                    inline: true
                }
            ]
        });

        await interaction.editReply({ embeds: [embed] });
    }
};
