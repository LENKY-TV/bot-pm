/**
 * Button: dashboard_tickets
 * Affiche les tickets du dashboard
 */

const TicketModel = require('../models/Ticket');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'dashboard_tickets',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        await interaction.deferReply({ ephemeral: true });

        const openTickets = TicketModel.getOpenByGuild(guildId);

        const embed = EmbedUtils.create(guildId, {
            title: '🎫 Tickets - Dashboard',
            description: `${openTickets.length} ticket(s) ouvert(s)`,
            fields: openTickets.slice(0, 25).map(ticket => ({
                name: `#${ticket.ticket_number} - ${ticket.service}`,
                value: [
                    `**Créé par:** <@${ticket.creator_id}>`,
                    `**Priorité:** ${ticket.priority}`,
                    ticket.claimed_by ? `**Agent:** <@${ticket.claimed_by}>` : '**Agent:** Non assigné'
                ].join('\n'),
                inline: true
            }))
        });

        if (openTickets.length === 0) {
            embed.setDescription('Aucun ticket ouvert.');
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
