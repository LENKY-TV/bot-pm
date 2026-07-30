/**
 * Button: ticket_priority
 * Change la priorité d'un ticket
 */

const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const TicketModel = require('../models/Ticket');
const LogModel = require('../models/log');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ticket_priority',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const channel = interaction.channel;

        // Vérifier que c'est un salon de ticket
        const ticket = TicketModel.getByChannel(channel.id);
        if (!ticket) {
            return interaction.reply({
                content: '❌ Ce salon n\'est pas un ticket.',
                ephemeral: true
            });
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_priority_select')
            .setPlaceholder('Sélectionnez une priorité')
            .addOptions([
                {
                    label: '🟢 Normal',
                    description: 'Priorité normale',
                    value: 'Normal'
                },
                {
                    label: '🟡 Important',
                    description: 'Priorité importante',
                    value: 'Important'
                },
                {
                    label: '🔴 Urgent',
                    description: 'Priorité urgente',
                    value: 'Urgent'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: 'Sélectionnez la nouvelle priorité :',
            components: [row],
            ephemeral: true
        });
    }
};
