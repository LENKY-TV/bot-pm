/**
 * Event: presenceUpdate
 * Suivi des agents en ligne
 */

const { Events, ActivityType } = require('discord.js');
const StaffModel = require('../models/Staff');
const Logger = require('../utils/logger');

module.exports = {
    name: Events.PresenceUpdate,
    once: false,

    async execute(oldPresence, newPresence, client) {
        const member = newPresence.member;
        if (!member || member.user.bot) return;

        const guildId = newPresence.guild.id;
        const isOnline = newPresence.status !== 'offline';

        try {
            StaffModel.setOnline(member.id, guildId, isOnline);
        } catch (error) {
            Logger.error('Erreur lors de la mise à jour de présence', error);
        }
    }
};
