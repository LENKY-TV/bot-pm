/**
 * Model: Config
 * Gestion de la configuration dynamique
 */

const { run, get, all } = require('../config/database');

class ConfigModel {
    /**
     * Récupère une valeur de configuration
     */
    static get(guildId, key) {
        const result = get('SELECT value FROM config WHERE guild_id = ? AND key = ?', [guildId, key]);
        return result ? result.value : null;
    }

    /**
     * Définit une valeur de configuration (INSERT ou UPDATE)
     */
    static set(guildId, key, value) {
        const existing = get('SELECT id FROM config WHERE guild_id = ? AND key = ?', [guildId, key]);
        if (existing) {
            run('UPDATE config SET value = ? WHERE guild_id = ? AND key = ?', [String(value), guildId, key]);
        } else {
            try {
                run('INSERT INTO config (guild_id, key, value) VALUES (?, ?, ?)', [guildId, key, String(value)]);
            } catch (e) {
                run('UPDATE config SET value = ? WHERE guild_id = ? AND key = ?', [String(value), guildId, key]);
            }
        }
    }

    /**
     * Récupère toute la configuration d'un serveur
     */
    static getAll(guildId) {
        const rows = all('SELECT key, value FROM config WHERE guild_id = ?', [guildId]);
        const config = {};
        rows.forEach(row => {
            config[row.key] = row.value;
        });
        return config;
    }

    /**
     * Supprime une configuration
     */
    static delete(guildId, key) {
        run('DELETE FROM config WHERE guild_id = ? AND key = ?', [guildId, key]);
    }

    /**
     * Initialise la configuration par défaut
     */
    static initDefaults(guildId) {
        const defaults = {
            'embed_color': '#1E3A5F',
            'embed_title': 'Police Municipale - Service RH',
            'embed_description': 'Sélectionnez un service pour créer un ticket.',
            'embed_footer': 'Police Municipale RH',
            'embed_image': '',
            'embed_thumbnail': '',
            'log_channel': '',
            'transcript_channel': '',
            'reminder_interval': '24',
            'reminder_max': '3',
            'ticket_category': '',
            'auto_role_notification': '1',
            'welcome_message': 'Bienvenue dans votre ticket {service}. Un agent vous répondra.',
            'close_message': 'Ce ticket a été fermé. Merci pour votre patience.',
            'rating_enabled': '1'
        };

        for (const [key, value] of Object.entries(defaults)) {
            const existing = get('SELECT id FROM config WHERE guild_id = ? AND key = ?', [guildId, key]);
            if (!existing) {
                try {
                    run('INSERT INTO config (guild_id, key, value) VALUES (?, ?, ?)', [guildId, key, value]);
                } catch (e) {
                    // Ignorer si déjà existant
                }
            }
        }
    }
}

module.exports = ConfigModel;
