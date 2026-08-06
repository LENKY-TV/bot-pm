/**
 * Event: messageCreate
 * Gestion des messages pour les statistiques + images NDS
 */

const { Events, EmbedBuilder } = require('discord.js');
const TicketModel = require('../models/Ticket');
const StaffModel = require('../models/Staff');
const { run } = require('../config/database');
const Logger = require('../utils/logger');

const ndsMessageIds = new Set();

function trackNdsMessage(messageId) {
    ndsMessageIds.add(messageId);
}

module.exports = {
    name: Events.MessageCreate,
    once: false,

    async execute(message, client) {
        if (message.author.bot) return;

        // Vérifier si c'est une réponse à un NDS
        if (message.reference && message.reference.messageId) {
            const repliedId = message.reference.messageId;
            if (ndsMessageIds.has(repliedId) && message.attachments.size > 0) {
                try {
                    const channel = message.channel;
                    const ndsMsg = await channel.messages.fetch(repliedId);
                    if (!ndsMsg || !ndsMsg.embeds[0]) return;

                    const attachment = message.attachments.first();
                    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
                    if (!validTypes.includes(attachment.contentType)) {
                        return message.reply('❌ Seules les images sont acceptées (PNG, JPG, GIF, WEBP).');
                    }

                    const imgEmbed = new EmbedBuilder()
                        .setImage(attachment.url)
                        .setColor(ndsMsg.embeds[0].color || '#FF0000');

                    await ndsMsg.reply({ embeds: [imgEmbed] });
                    await message.react('✅');
                    Logger.info(`[NDS] Image ajoutée au NDS ${repliedId}`);
                } catch (error) {
                    Logger.error('[NDS] Erreur ajout image reply', error);
                }
                return;
            }
        }

        // Statistiques tickets
        const ticket = TicketModel.getByChannel(message.channel.id);
        if (!ticket) return;

        try {
            run('UPDATE tickets SET message_count = message_count + 1 WHERE channel_id = ?', [message.channel.id]);
            TicketModel.updateActivity(message.channel.id);

            if (ticket.claimed_by === message.author.id) {
                run('UPDATE staff SET total_messages = total_messages + 1 WHERE user_id = ? AND guild_id = ?', [message.author.id, message.guild.id]);
            }
        } catch (error) {
            Logger.error('Erreur lors de la mise à jour des statistiques', error);
        }
    }
};

module.exports.trackNdsMessage = trackNdsMessage;
