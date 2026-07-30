/**
 * Button: ticket_unlock
 * Déverrouille un ticket
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const TicketModel = require('../models/Ticket');
const LogModel = require('../models/log');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ticket_unlock',

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

        try {
            // Déverrouiller le salon pour le créateur
            await channel.permissionOverwrites.edit(ticket.creator_id, {
                SendMessages: true
            });

            // Logger l'action
            LogModel.create({
                guild_id: guildId,
                ticket_id: ticket.id,
                action: 'ticket_unlock',
                user_id: interaction.user.id,
                details: 'Ticket déverrouillé'
            });

            Logger.info(`Ticket #${ticket.ticket_number} déverrouillé par ${interaction.user.tag}`);

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

            const embed = EmbedUtils.success(guildId, '🔓 Ticket déverrouillé', 'Ce ticket a été déverrouillé. Le créateur peut à nouveau envoyer des messages.');

            await interaction.reply({ embeds: [embed], components: [row] });
        } catch (error) {
            Logger.error('Erreur lors du déverrouillage', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue.',
                ephemeral: true
            });
        }
    }
};
