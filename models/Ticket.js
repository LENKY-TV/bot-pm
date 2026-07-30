/**
 * Model: Ticket
 * Gestion des tickets dans la base de données
 */

const { run, get, all } = require('../config/database');

class TicketModel {
    /**
     * Crée un nouveau ticket
     */
    static create(data) {
        return run(
            `INSERT INTO tickets (ticket_number, guild_id, channel_id, creator_id, service, category_id, channel_name)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [data.ticket_number, data.guild_id, data.channel_id, data.creator_id, data.service, data.category_id, data.channel_name]
        );
    }

    /**
     * Récupère un ticket par son channel ID
     */
    static getByChannel(channelId) {
        return get('SELECT * FROM tickets WHERE channel_id = ? AND status = ?', [channelId, 'open']);
    }

    /**
     * Récupère un ticket par son ID
     */
    static getById(id) {
        return get('SELECT * FROM tickets WHERE id = ?', [id]);
    }

    /**
     * Récupère le prochain numéro de ticket
     */
    static getNextNumber(guildId) {
        const result = get('SELECT MAX(ticket_number) as max FROM tickets WHERE guild_id = ?', [guildId]);
        return (result?.max || 0) + 1;
    }

    /**
     * Met à jour le ticket
     */
    static update(channelId, data) {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (fields.length === 0) return null;
        values.push(channelId);
        return run(`UPDATE tickets SET ${fields.join(', ')} WHERE channel_id = ?`, values);
    }

    /**
     * Met à jour par ID
     */
    static updateById(id, data) {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (fields.length === 0) return null;
        values.push(id);
        return run(`UPDATE tickets SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    /**
     * Ferme un ticket
     */
    static close(channelId) {
        return this.update(channelId, {
            status: 'closed',
            closed_at: new Date().toISOString()
        });
    }

    /**
     * Récupère les tickets ouverts d'un utilisateur
     */
    static getOpenByUser(userId, guildId) {
        return all('SELECT * FROM tickets WHERE creator_id = ? AND guild_id = ? AND status = ?', [userId, guildId, 'open']);
    }

    /**
     * Récupère tous les tickets ouverts d'un serveur
     */
    static getOpenByGuild(guildId) {
        return all('SELECT * FROM tickets WHERE guild_id = ? AND status = ?', [guildId, 'open']);
    }

    /**
     * Récupère les tickets inactifs
     */
    static getInactive(guildId, hours) {
        const date = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
        return all('SELECT * FROM tickets WHERE guild_id = ? AND status = ? AND last_activity < ? AND claimed_by IS NOT NULL', [guildId, 'open', date]);
    }

    /**
     * Recherche des tickets
     */
    static search(guildId, query) {
        return all(
            `SELECT * FROM tickets 
             WHERE guild_id = ? AND (
                 creator_id LIKE ? OR 
                 channel_id LIKE ? OR 
                 service LIKE ? OR
                 channel_name LIKE ? OR
                 CAST(ticket_number AS TEXT) LIKE ?
             )
             ORDER BY created_at DESC
             LIMIT 25`,
            [guildId, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
        );
    }

    /**
     * Récupère les statistiques d'un serveur
     */
    static getStats(guildId) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekStr = weekStart.toISOString().split('T')[0];
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthStr = monthStart.toISOString().split('T')[0];

        return {
            total: get('SELECT COUNT(*) as count FROM tickets WHERE guild_id = ?', [guildId])?.count || 0,
            open: get('SELECT COUNT(*) as count FROM tickets WHERE guild_id = ? AND status = ?', [guildId, 'open'])?.count || 0,
            closed: get('SELECT COUNT(*) as count FROM tickets WHERE guild_id = ? AND status = ?', [guildId, 'closed'])?.count || 0,
            today: get('SELECT COUNT(*) as count FROM tickets WHERE guild_id = ? AND created_at >= ?', [guildId, today])?.count || 0,
            thisWeek: get('SELECT COUNT(*) as count FROM tickets WHERE guild_id = ? AND created_at >= ?', [guildId, weekStr])?.count || 0,
            thisMonth: get('SELECT COUNT(*) as count FROM tickets WHERE guild_id = ? AND created_at >= ?', [guildId, monthStr])?.count || 0,
            avgResponseTime: get(`SELECT AVG(CAST((julianday(first_response_at) - julianday(created_at)) * 24 * 60 AS INTEGER)) as avg FROM tickets WHERE guild_id = ? AND first_response_at IS NOT NULL`, [guildId])?.avg || 0,
            avgResolutionTime: get(`SELECT AVG(CAST((julianday(closed_at) - julianday(created_at)) * 24 * 60 AS INTEGER)) as avg FROM tickets WHERE guild_id = ? AND closed_at IS NOT NULL`, [guildId])?.avg || 0,
            totalMessages: get('SELECT SUM(message_count) as total FROM tickets WHERE guild_id = ?', [guildId])?.total || 0,
            totalClaims: get('SELECT COUNT(*) as count FROM claims WHERE ticket_id IN (SELECT id FROM tickets WHERE guild_id = ?)', [guildId])?.count || 0
        };
    }

    /**
     * Récupère les stats par service
     */
    static getStatsByService(guildId) {
        return all('SELECT service, COUNT(*) as count FROM tickets WHERE guild_id = ? GROUP BY service ORDER BY count DESC', [guildId]);
    }

    /**
     * Récupère le top staff
     */
    static getTopStaff(guildId, limit = 10) {
        return all(
            `SELECT s.user_id, s.tickets_handled, s.avg_response_time, s.rating_sum, s.rating_count,
                    CASE WHEN s.rating_count > 0 THEN CAST(s.rating_sum AS REAL) / s.rating_count ELSE 0 END as avg_rating
             FROM staff s
             WHERE s.guild_id = ?
             ORDER BY s.tickets_handled DESC
             LIMIT ?`,
            [guildId, limit]
        );
    }

    /**
     * Met à jour l'activité
     */
    static updateActivity(channelId) {
        return run('UPDATE tickets SET last_activity = datetime("now") WHERE channel_id = ?', [channelId]);
    }
}

module.exports = TicketModel;
