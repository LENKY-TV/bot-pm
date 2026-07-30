/**
 * Handler: Événements
 * Chargement automatique des événements Discord
 */

const fs = require('fs');
const path = require('path');
const Logger = require('../utils/logger');

class EventHandler {
    constructor(client) {
        this.client = client;
    }

    /**
     * Charge tous les événements
     */
    async loadEvents() {
        const eventsPath = path.join(__dirname, '..', 'events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);

            if (event.once) {
                this.client.once(event.name, (...args) => event.execute(...args, this.client));
            } else {
                this.client.on(event.name, (...args) => event.execute(...args, this.client));
            }

            Logger.info(`Événement chargé: ${event.name}`);
        }
    }
}

module.exports = EventHandler;
