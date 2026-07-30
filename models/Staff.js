/**
 * Model: Staff
 * Gestion du personnel
 */

const { run, get, all } = require('../config/database');

class StaffModel {
    /**
     * Récupère ou crée un membre du staff
     */
    static getOrCreate(userId, guildId) {
        let staff = get('SELECT * FROM staff WHERE user_id = ? AND guild_id = ?', [userId, guildId]);
        if (!staff) {
            run('INSERT INTO staff (user_id, guild_id) VALUES (?, ?)', [userId, guildId]);
            staff = get('SELECT * FROM staff WHERE user_id = ? AND guild_id = ?', [userId, guildId]);
        }
        return staff;
    }

    /**
     * Incrémente les tickets gérés
     */
    static incrementHandled(userId, guildId) {
        this.getOrCreate(userId, guildId);
        return run('UPDATE staff SET tickets_handled = tickets_handled + 1 WHERE user_id = ? AND guild_id = ?', [userId, guildId]);
    }

    /**
     * Met à jour le temps de réponse moyen
     */
    static updateResponseTime(userId, guildId, responseTime) {
        this.getOrCreate(userId, guildId);
        const staff = this.getOrCreate(userId, guildId);
        const newAvg = staff.avg_response_time === 0 
            ? responseTime 
            : (staff.avg_response_time + responseTime) / 2;
        return run('UPDATE staff SET avg_response_time = ? WHERE user_id = ? AND guild_id = ?', [newAvg, userId, guildId]);
    }

    /**
     * Ajoute un rating
     */
    static addRating(userId, guildId, rating) {
        this.getOrCreate(userId, guildId);
        return run('UPDATE staff SET rating_sum = rating_sum + ?, rating_count = rating_count + 1 WHERE user_id = ? AND guild_id = ?', [rating, userId, guildId]);
    }

    /**
     * Met à jour le statut en ligne
     */
    static setOnline(userId, guildId, isOnline) {
        this.getOrCreate(userId, guildId);
        return run('UPDATE staff SET is_online = ?, last_active = datetime("now") WHERE user_id = ? AND guild_id = ?', [isOnline ? 1 : 0, userId, guildId]);
    }

    /**
     * Récupère le top staff
     */
    static getTop(guildId, limit = 10) {
        return all(
            `SELECT *, 
                    CASE WHEN rating_count > 0 THEN CAST(rating_sum AS REAL) / rating_count ELSE 0 END as avg_rating
             FROM staff 
             WHERE guild_id = ? 
             ORDER BY tickets_handled DESC 
             LIMIT ?`,
            [guildId, limit]
        );
    }

    /**
     * Récupère les agents en ligne
     */
    static getOnline(guildId) {
        return all('SELECT * FROM staff WHERE guild_id = ? AND is_online = 1', [guildId]);
    }
}

module.exports = StaffModel;
