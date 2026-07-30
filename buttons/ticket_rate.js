/**
 * Button: ticket_rate_[1-10]
 * Système d'évaluation des tickets
 */

const { run, get } = require('../config/database');
const TicketModel = require('../models/Ticket');
const StaffModel = require('../models/Staff');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

// Générer les boutons de rating
const ratingButtons = [];
for (let i = 1; i <= 10; i++) {
    ratingButtons.push({
        customId: `ticket_rate_${i}`,
        async execute(interaction, client) {
            const guildId = interaction.guild.id;
            const rating = i;
            const userId = interaction.user.id;

            try {
                const ticket = get(
                    `SELECT * FROM tickets WHERE creator_id = ? AND guild_id = ? AND status = 'closed' ORDER BY closed_at DESC LIMIT 1`,
                    [userId, guildId]
                );

                if (!ticket) {
                    return interaction.reply({
                        content: '❌ Aucun ticket fermé trouvé à évaluer.',
                        ephemeral: true
                    });
                }

                const existingRating = get('SELECT * FROM ratings WHERE ticket_id = ? AND user_id = ?', [ticket.id, userId]);

                if (existingRating) {
                    return interaction.reply({
                        content: '❌ Vous avez déjà évalué ce ticket.',
                        ephemeral: true
                    });
                }

                run('INSERT INTO ratings (ticket_id, user_id, rating) VALUES (?, ?, ?)', [ticket.id, userId, rating]);

                if (ticket.claimed_by) {
                    StaffModel.addRating(ticket.claimed_by, guildId, rating);
                }

                TicketModel.updateById(ticket.id, { rating });

                const embed = EmbedUtils.success(guildId, '⭐ Évaluation enregistrée', 
                    `Merci pour votre évaluation de **${rating}/10** pour le ticket #${ticket.ticket_number}.`);

                await interaction.reply({ embeds: [embed], ephemeral: true });

                Logger.info(`Ticket #${ticket.ticket_number} évalué ${rating}/10 par ${interaction.user.tag}`);
            } catch (error) {
                Logger.error('Erreur lors de l\'évaluation', error);
                await interaction.reply({
                    content: '❌ Une erreur est survenue.',
                    ephemeral: true
                });
            }
        }
    });
}

module.exports = ratingButtons[0];
