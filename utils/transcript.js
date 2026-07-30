/**
 * Utilitaire: Transcript
 * Génération de transcriptions HTML
 */

const fs = require('fs');
const path = require('path');

class TranscriptUtils {
    /**
     * Génère une transcription HTML
     */
    static async generate(channel, ticket) {
        try {
            // Récupérer tous les messages
            const messages = [];
            let lastId = null;
            let fetchMore = true;

            while (fetchMore) {
                const options = { limit: 100 };
                if (lastId) options.before = lastId;

                const fetchedMessages = await channel.messages.fetch(options);
                if (fetchedMessages.size === 0) {
                    fetchMore = false;
                } else {
                    messages.push(...fetchedMessages.values());
                    lastId = fetchedMessages.last()?.id;
                    if (fetchedMessages.size < 100) fetchMore = false;
                }
            }

            // Trier par date
            messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

            // Générer le HTML
            const html = this.generateHTML(messages, ticket, channel);

            // Sauvegarder le fichier
            const transcriptDir = path.join(__dirname, '..', 'transcripts');
            if (!fs.existsSync(transcriptDir)) {
                fs.mkdirSync(transcriptDir, { recursive: true });
            }

            const fileName = `ticket-${ticket.ticket_number}-${Date.now()}.html`;
            const filePath = path.join(transcriptDir, fileName);
            fs.writeFileSync(filePath, html, 'utf-8');

            return filePath;
        } catch (error) {
            console.error('Erreur lors de la génération du transcript:', error);
            return null;
        }
    }

    /**
     * Génère le HTML de la transcription
     */
    static generateHTML(messages, ticket, channel) {
        const messagesHTML = messages.map(msg => {
            const author = msg.author;
            const timestamp = new Date(msg.createdTimestamp).toLocaleString('fr-FR');
            const content = this.escapeHTML(msg.content || '');
            
            // Gérer les embeds
            let embedsHTML = '';
            if (msg.embeds.length > 0) {
                embedsHTML = msg.embeds.map(embed => `
                    <div class="embed">
                        ${embed.title ? `<div class="embed-title">${this.escapeHTML(embed.title)}</div>` : ''}
                        ${embed.description ? `<div class="embed-description">${this.escapeHTML(embed.description)}</div>` : ''}
                        ${embed.fields ? embed.fields.map(f => `
                            <div class="embed-field">
                                <div class="embed-field-name">${this.escapeHTML(f.name)}</div>
                                <div class="embed-field-value">${this.escapeHTML(f.value)}</div>
                            </div>
                        `).join('') : ''}
                    </div>
                `).join('');
            }

            // Gérer les pièces jointes
            let attachmentsHTML = '';
            if (msg.attachments.size > 0) {
                attachmentsHTML = `<div class="attachments">
                    ${msg.attachments.map(a => `
                        <div class="attachment">
                            ${a.contentType?.startsWith('image/') 
                                ? `<img src="${a.url}" alt="${a.name}" style="max-width: 400px; border-radius: 8px;">`
                                : `<a href="${a.url}">${a.name}</a>`
                            }
                        </div>
                    `).join('')}
                </div>`;
            }

            // Gérer les réactions
            let reactionsHTML = '';
            if (msg.reactions.cache.size > 0) {
                reactionsHTML = `<div class="reactions">
                    ${msg.reactions.cache.map(r => `
                        <span class="reaction">${r.emoji.name} ${r.count}</span>
                    `).join('')}
                </div>`;
            }

            return `
                <div class="message ${author.bot ? 'bot' : ''}">
                    <div class="message-avatar">
                        <img src="${author.displayAvatarURL({ extension: 'png', size: 64 })}" alt="${author.username}">
                    </div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-author">${this.escapeHTML(author.username)}</span>
                            <span class="message-timestamp">${timestamp}</span>
                        </div>
                        <div class="message-body">${content}</div>
                        ${embedsHTML}
                        ${attachmentsHTML}
                        ${reactionsHTML}
                    </div>
                </div>
            `;
        }).join('');

        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transcript - Ticket #${ticket.ticket_number}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #36393f;
            color: #dcddde;
            line-height: 1.4;
            padding: 20px;
        }

        .header {
            background-color: #2f3136;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }

        .header h1 {
            color: #ffffff;
            font-size: 24px;
            margin-bottom: 10px;
        }

        .header p {
            color: #b9bbbe;
            font-size: 14px;
        }

        .messages {
            max-width: 900px;
            margin: 0 auto;
        }

        .message {
            display: flex;
            padding: 10px;
            margin-bottom: 5px;
            border-radius: 4px;
            transition: background-color 0.2s;
        }

        .message:hover {
            background-color: #32353b;
        }

        .message.bot {
            background-color: #2d2f34;
            border-left: 3px solid #5865f2;
        }

        .message-avatar {
            margin-right: 15px;
            flex-shrink: 0;
        }

        .message-avatar img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
        }

        .message-content {
            flex: 1;
            min-width: 0;
        }

        .message-header {
            display: flex;
            align-items: baseline;
            gap: 10px;
            margin-bottom: 5px;
        }

        .message-author {
            font-weight: 600;
            color: #ffffff;
            font-size: 15px;
        }

        .message-author:hover {
            text-decoration: underline;
            cursor: pointer;
        }

        .message-timestamp {
            font-size: 12px;
            color: #72767d;
        }

        .message-body {
            word-wrap: break-word;
            white-space: pre-wrap;
        }

        .embed {
            background-color: #2f3136;
            border-left: 4px solid #5865f2;
            border-radius: 4px;
            padding: 10px 15px;
            margin-top: 5px;
            max-width: 520px;
        }

        .embed-title {
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 5px;
        }

        .embed-description {
            color: #dcddde;
            font-size: 14px;
        }

        .embed-field {
            margin-top: 10px;
        }

        .embed-field-name {
            font-weight: 600;
            color: #ffffff;
            font-size: 13px;
            margin-bottom: 3px;
        }

        .embed-field-value {
            color: #dcddde;
            font-size: 13px;
        }

        .attachments {
            margin-top: 5px;
        }

        .attachment {
            margin-bottom: 5px;
        }

        .reactions {
            margin-top: 5px;
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
        }

        .reaction {
            background-color: #2f3136;
            border: 1px solid #40444b;
            border-radius: 8px;
            padding: 2px 8px;
            font-size: 14px;
            cursor: pointer;
        }

        .reaction:hover {
            background-color: #36393f;
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: #72767d;
            font-size: 12px;
            margin-top: 20px;
        }

        @media (max-width: 600px) {
            .message {
                flex-direction: column;
            }

            .message-avatar {
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 Transcript - Ticket #${ticket.ticket_number}</h1>
        <p>Service: ${ticket.service} | Créé le: ${new Date(ticket.created_at).toLocaleString('fr-FR')}</p>
        <p>Salon: #${channel.name} | Messages: ${messages.length}</p>
    </div>
    <div class="messages">
        ${messagesHTML}
    </div>
    <div class="footer">
        Transcript généré le ${new Date().toLocaleString('fr-FR')} | Police Municipale RH
    </div>
</body>
</html>
        `;
    }

    /**
     * Échappe les caractères HTML
     */
    static escapeHTML(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

module.exports = TranscriptUtils;
