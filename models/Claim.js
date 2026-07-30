/**
 * Model: Claim
 * Gestion des prises en charge
 */

const { run, get, all } = require('../config/database');

class ClaimModel {
    /**
     * Crée un claim
     */
    static create(data) {
        return run(
            `INSERT INTO claims (ticket_id, agent_id)
             VALUES (?, ?)`,
            [data.ticket_id, data.agent_id]
        );
    }

    /**
     * Récupère les claims d'un ticket
     */
    static getByTicket(ticketId) {
        return all('SELECT * FROM claims WHERE ticket_id = ? ORDER BY claimed_at DESC', [ticketId]);
    }

    /**
     * Récupère les claims d'un agent
     */
    static getByAgent(agentId, guildId) {
        return all(
            `SELECT c.*, t.ticket_number, t.service 
             FROM claims c
             JOIN tickets t ON c.ticket_id = t.id
             WHERE c.agent_id = ? AND t.guild_id = ?
             ORDER BY c.claimed_at DESC`,
            [agentId, guildId]
        );
    }

    /**
     * Libère un claim
     */
    static release(ticketId, agentId) {
        return run(
            `UPDATE claims SET released_at = datetime('now') WHERE ticket_id = ? AND agent_id = ? AND released_at IS NULL`,
            [ticketId, agentId]
        );
    }
}

module.exports = ClaimModel;
