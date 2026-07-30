/**
 * Select Menu: search_ticket_select
 * Sélection d'un ticket dans les résultats de recherche
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const TicketModel = require('../models/Ticket');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'search_ticket_select',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const channelId = interaction.values[0];

        const ticket = TicketModel.getByChannel(channelId);
        if (!ticket) {
            // Essayer de récupérer le ticket par ID
            const allTickets = TicketModel.search(guildId, channelId);
            if (allTickets.length === 0) {
                return interaction.reply({
                    content: '❌ Ticket introuvable.',
                    ephemeral: true
                });
            }
        }

        const ticketData = ticket || TicketModel.search(guildId, channelId)[0];

        const embed = EmbedUtils.create(guildId, {
            title: `📋 Ticket #${ticketData.ticket_number} - ${ticketData.service}`,
            fields: [
                { name: 'Statut', value: ticketData.status === 'open' ? '🟢 Ouvert' : '🔴 Fermé', inline: true },
                { name: 'Créé par', value: `<@${ticketData.creator_id}>`, inline: true },
                { name: 'Service', value: ticketData.service, inline: true },
                { name: 'Priorité', value: ticketData.priority, inline: true },
                { name: 'Agent', value: ticketData.claimed_by ? `<@${ticketData.claimed_by}>` : 'Non assigné', inline: true },
                { name: 'Messages', value: `${ticketData.message_count}`, inline: true },
                { name: 'Date', value: new Date(ticketData.created_at).toLocaleString('fr-FR'), inline: true }
            ],
            color: ticketData.status === 'open' ? '#00FF00' : '#FF0000'
        });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Aller au salon')
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/channels/${guildId}/${ticketData.channel_id}`)
        );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};
