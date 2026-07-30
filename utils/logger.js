/**
 * Utilitaire: Logger
 * Système de logging
 */

const fs = require('fs');
const path = require('path');
const config = require('../config/config');

const LOG_DIR = path.join(__dirname, '..', 'logs');

// Créer le dossier logs s'il n'existe pas
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

class Logger {
    /**
     * Écrit un log dans un fichier
     */
    static write(level, message, data = null) {
        const timestamp = new Date().toISOString();
        let logEntry;
        
        if (data instanceof Error) {
            logEntry = `[${timestamp}] [${level}] ${message} | ${data.stack || data.message}`;
        } else if (data) {
            logEntry = `[${timestamp}] [${level}] ${message} | ${JSON.stringify(data)}`;
        } else {
            logEntry = `[${timestamp}] [${level}] ${message}`;
        }

        const logFile = path.join(LOG_DIR, `${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, logEntry + '\n');

        const colors = {
            INFO: '\x1b[36m',
            WARN: '\x1b[33m',
            ERROR: '\x1b[31m',
            DEBUG: '\x1b[35m'
        };
        console.log(`${colors[level] || ''}${logEntry}\x1b[0m`);
    }

    static info(message, data) {
        this.write('INFO', message, data);
    }

    static warn(message, data) {
        this.write('WARN', message, data);
    }

    static error(message, data) {
        this.write('ERROR', message, data);
    }

    static debug(message, data) {
        this.write('DEBUG', message, data);
    }

    /**
     * Log d'ouverture de ticket
     */
    static ticketOpen(ticketNumber, userId, service) {
        this.info(`Ticket #${ticketNumber} ouvert`, { userId, service });
    }

    /**
     * Log de fermeture de ticket
     */
    static ticketClose(ticketNumber, userId) {
        this.info(`Ticket #${ticketNumber} fermé`, { userId });
    }

    /**
     * Log de claim
     */
    static ticketClaim(ticketNumber, agentId) {
        this.info(`Ticket #${ticketNumber} pris en charge`, { agentId });
    }

    /**
     * Log de configuration
     */
    static configChange(guildId, userId, key, value) {
        this.info(`Configuration modifiée`, { guildId, userId, key, value });
    }
}

module.exports = Logger;
