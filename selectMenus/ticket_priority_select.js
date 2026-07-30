/**
 * Select Menu: ticket_priority_select
 * Sélection de priorité pour un ticket
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const TicketModel = require('../models/Ticket');
const LogModel = require('../models/log');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ticket_priority_select',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const channel = interaction.channel;
        const priority = interaction.values[0];

        // Vérifier que c'est un salon de ticket
        const ticket = TicketModel.getByChannel(channel.id);
        if (!ticket) {
            return interaction.reply({
                content: '❌ Ce salon n\'est pas un ticket.',
                ephemeral: true
            });
        }

        // Mettre à jour la priorité
        const priorityColors = {
            'Normal': '#3498DB',
            'Important': '#FFA500',
            'Urgent': '#FF0000'
        };

        TicketModel.update(channel.id, { priority });

        // Logger l'action
        LogModel.create({
            guild_id: guildId,
            ticket_id: ticket.id,
            action: 'ticket_priority',
            user_id: interaction.user.id,
            details: `Priorité changée en "${priority}"`
        });

        Logger.info(`Ticket #${ticket.ticket_number} priorité changée en "${priority}" par ${interaction.user.tag}`);

        const embed = EmbedUtils.create(guildId, {
            title: '🎯 Priorité mise à jour',
            description: `La priorité du ticket a été changée en **${priority}**.`,
            color: priorityColors[priority]
        });

        // Modifier les boutons
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_rename')
                .setLabel('Renommer')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('✏️'),
            new ButtonBuilder()
                .setCustomId('ticket_priority')
                .setLabel('Priorité')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎯'),
            new ButtonBuilder()
                .setCustomId('ticket_notes')
                .setLabel('Notes')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📝'),
            new ButtonBuilder()
                .setCustomId('ticket_lock')
                .setLabel('Verrouiller')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒'),
            new ButtonBuilder()
                .setCustomId('ticket_close')
                .setLabel('Fermer')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌')
        );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};
