/**
 * Button: ticket_close_all
 * Ferme tous les tickets ouverts
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const TicketModel = require('../models/Ticket');
const LogModel = require('../models/log');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ticket_close_all',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        // Vérifier les permissions
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: '❌ Vous n\'avez pas les permissions nécessaires.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        // Récupérer les tickets ouverts
        const tickets = TicketModel.getOpenByGuild(guildId);

        if (tickets.length === 0) {
            return interaction.editReply({
                content: '❌ Aucun ticket ouvert.'
            });
        }

        let closed = 0;
        for (const ticket of tickets) {
            const channel = interaction.guild.channels.cache.get(ticket.channel_id);
            if (channel) {
                TicketModel.update(channel.id, {
                    status: 'closed',
                    closed_at: new Date().toISOString()
                });

                LogModel.create({
                    guild_id: guildId,
                    ticket_id: ticket.id,
                    action: 'ticket_close',
                    user_id: interaction.user.id,
                    details: `Fermé par ${interaction.user.tag}`
                });

                try {
                    await channel.delete();
                } catch (error) {
                    Logger.error(`Erreur lors de la suppression du salon ${channel.name}`, error);
                }

                closed++;
            }
        }

        Logger.info(`${closed} tickets fermés par ${interaction.user.tag}`);

        const embed = EmbedUtils.success(guildId, '🔒 Tickets fermés', `${closed} ticket(s) ont été fermés.`);

        await interaction.editReply({ embeds: [embed] });
    }
};
