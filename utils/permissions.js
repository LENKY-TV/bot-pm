/**
 * Utilitaire: Permissions
 * Gestion des permissions du bot
 */

const { PermissionFlagsBits } = require('discord.js');
const config = require('../config/config');

class PermissionUtils {
    /**
     * Vérifie si un utilisateur a les permissions admin
     */
    static isAdmin(member) {
        return member.permissions.has(PermissionFlagsBits.Administrator);
    }

    /**
     * Vérifie si un utilisateur a les permissions de gestion
     */
    static isManager(member) {
        return member.permissions.has(PermissionFlagsBits.ManageGuild) ||
               member.permissions.has(PermissionFlagsBits.Administrator);
    }

    /**
     * Vérifie si un utilisateur est staff
     */
    static isStaff(member) {
        return this.isAdmin(member) || this.isManager(member);
    }

    /**
     * Vérifie si le bot a les permissions nécessaires
     */
    static checkBotPermissions(channel) {
        const required = [
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageMessages
        ];

        const missing = required.filter(perm => !channel.permissionsFor(channel.guild.members.me).has(perm));
        return {
            hasPermissions: missing.length === 0,
            missing
        };
    }

    /**
     * Génère les permissions pour un salon de ticket
     */
    static getTicketPermissions(guild, creatorId, serviceRole) {
        const permissions = [
            {
                id: guild.id,
                allow: [PermissionFlagsBits.ViewChannel],
                deny: [PermissionFlagsBits.SendMessages]
            },
            {
                id: creatorId,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.EmbedLinks,
                    PermissionFlagsBits.AttachFiles
                ]
            }
        ];

        // Ajouter le rôle du service s'il existe
        if (serviceRole) {
            permissions.push({
                id: serviceRole.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.EmbedLinks,
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.ManageMessages
                ]
            });
        }

        return permissions;
    }
}

module.exports = PermissionUtils;
