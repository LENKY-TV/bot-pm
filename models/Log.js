/**
 * Model: Log
 * Gestion des logs
 */

const { run, get, all } = require('../config/database');

class LogModel {
    /**
     * Crée un log
     */
    static create(data) {
        return run(
            `INSERT INTO logs (guild_id, ticket_id, action, user_id, details)
             VALUES (?, ?, ?, ?, ?)`,
            [data.guild_id, data.ticket_id, data.action, data.user_id, data.details || null]
        );
    }

    /**
     * Récupère les logs d'un ticket
     */
    static getByTicket(ticketId) {
        return all('SELECT * FROM logs WHERE ticket_id = ? ORDER BY created_at DESC', [ticketId]);
    }

    /**
     * Récupère les logs récents d'un serveur
     */
    static getRecent(guildId, limit = 50) {
        return all('SELECT * FROM logs WHERE guild_id = ? ORDER BY created_at DESC LIMIT ?', [guildId, limit]);
    }

    /**
     * Récupère les logs par type d'action
     */
    static getByAction(guildId, action, limit = 25) {
        return all('SELECT * FROM logs WHERE guild_id = ? AND action = ? ORDER BY created_at DESC LIMIT ?', [guildId, action, limit]);
    }
}

module.exports = LogModel;
