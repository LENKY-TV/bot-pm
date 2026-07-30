/**
 * Button: ticket_stats
 * Affiche les statistiques des tickets
 */

const TicketModel = require('../models/Ticket');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ticket_stats',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        await interaction.deferReply({ ephemeral: true });

        const stats = TicketModel.getStats(guildId);

        const embed = EmbedUtils.create(guildId, {
            title: '📊 Statistiques Rapides',
            fields: [
                { name: 'Ouverts', value: `\`${stats.open}\``, inline: true },
                { name: 'Fermés', value: `\`${stats.closed}\``, inline: true },
                { name: 'Aujourd\'hui', value: `\`${stats.today}\``, inline: true },
                { name: 'Cette semaine', value: `\`${stats.thisWeek}\``, inline: true },
                { name: 'Ce mois', value: `\`${stats.thisMonth}\``, inline: true },
                { name: 'Messages', value: `\`${stats.totalMessages}\``, inline: true }
            ]
        });

        await interaction.editReply({ embeds: [embed] });
    }
};
