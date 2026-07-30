/**
 * Button: dashboard_stats
 * Affiche les statistiques du dashboard
 */

const TicketModel = require('../models/Ticket');
const StaffModel = require('../models/Staff');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'dashboard_stats',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        await interaction.deferReply({ ephemeral: true });

        const stats = TicketModel.getStats(guildId);
        const topStaff = TicketModel.getTopStaff(guildId, 5);

        const embed = EmbedUtils.create(guildId, {
            title: '📊 Statistiques Détaillées',
            fields: [
                {
                    name: '📈 Général',
                    value: [
                        `**Ouverts:** \`${stats.open}\``,
                        `**Fermés:** \`${stats.closed}\``,
                        `**Total:** \`${stats.total}\``
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '📅 Période',
                    value: [
                        `**Aujourd'hui:** \`${stats.today}\``,
                        `**Semaine:** \`${stats.thisWeek}\``,
                        `**Mois:** \`${stats.thisMonth}\``
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '⏱️ Performance',
                    value: [
                        `**Réponse:** \`${Math.round(stats.avgResponseTime)} min\``,
                        `**Résolution:** \`${Math.round(stats.avgResolutionTime)} min\``
                    ].join('\n'),
                    inline: true
                }
            ]
        });

        await interaction.editReply({ embeds: [embed] });
    }
};
