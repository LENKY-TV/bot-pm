/**
 * Button: ticket_lock
 * Verrouille un ticket
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const TicketModel = require('../models/Ticket');
const LogModel = require('../models/Log');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'ticket_lock',

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
            // Verrouiller le salon pour le créateur
            await channel.permissionOverwrites.edit(ticket.creator_id, {
                SendMessages: false
            });

            // Logger l'action
            LogModel.create({
                guild_id: guildId,
                ticket_id: ticket.id,
                action: 'ticket_lock',
                user_id: interaction.user.id,
                details: 'Ticket verrouillé'
            });

            Logger.info(`Ticket #${ticket.ticket_number} verrouillé par ${interaction.user.tag}`);

            // Modifier les boutons
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_unlock')
                    .setLabel('Déverrouiller')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔓'),
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Fermer')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌')
            );

            const embed = EmbedUtils.warning(guildId, '🔒 Ticket verrouillé', 'Ce ticket a été verrouillé. Le créateur ne peut plus envoyer de messages.');

            await interaction.reply({ embeds: [embed], components: [row] });
        } catch (error) {
            Logger.error('Erreur lors du verrouillage', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue.',
                ephemeral: true
            });
        }
    }
};
