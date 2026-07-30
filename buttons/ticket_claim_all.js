/**
 * Button: ticket_claim_all
 * Revendique tous les tickets ouverts
 */

const TicketModel = require('../models/Ticket');
const StaffModel = require('../models/Staff');
const ClaimModel = require('../models/Claim');
const LogModel = require('../models/Log');
const { all } = require('../config/database');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ticket_claim_all',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        await interaction.deferReply({ ephemeral: true });

        const tickets = all(
            'SELECT * FROM tickets WHERE guild_id = ? AND status = ? AND claimed_by IS NULL',
            [guildId, 'open']
        );

        if (tickets.length === 0) {
            return interaction.editReply({
                content: '❌ Aucun ticket non réclamé.'
            });
        }

        let claimed = 0;
        for (const ticket of tickets) {
            const channel = interaction.guild.channels.cache.get(ticket.channel_id);
            if (channel) {
                TicketModel.update(channel.id, {
                    claimed_by: userId,
                    claimed_at: new Date().toISOString(),
                    first_response_at: new Date().toISOString()
                });

                ClaimModel.create({
                    ticket_id: ticket.id,
                    agent_id: userId
                });

                StaffModel.incrementHandled(userId, guildId);

                LogModel.create({
                    guild_id: guildId,
                    ticket_id: ticket.id,
                    action: 'ticket_claim',
                    user_id: userId,
                    details: `Réclamé par ${interaction.user.tag}`
                });

                claimed++;
            }
        }

        Logger.info(`${claimed} tickets réclamés par ${interaction.user.tag}`);

        const embed = EmbedUtils.success(guildId, '📋 Tickets réclamés', `${claimed} ticket(s) ont été réclamés.`);

        await interaction.editReply({ embeds: [embed] });
    }
};
