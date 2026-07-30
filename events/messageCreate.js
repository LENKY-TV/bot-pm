/**
 * Event: messageCreate
 * Gestion des messages pour les statistiques
 */

const { Events } = require('discord.js');
const TicketModel = require('../models/Ticket');
const StaffModel = require('../models/Staff');
const { run } = require('../config/database');
const Logger = require('../utils/logger');

module.exports = {
    name: Events.MessageCreate,
    once: false,

    async execute(message, client) {
        if (message.author.bot) return;

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
