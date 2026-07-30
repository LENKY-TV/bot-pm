/**
 * Utilitaire: Embed Builder
 * Construction d'embeds professionnels
 */

const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');
const ConfigModel = require('../models/Config');

class EmbedUtils {
    /**
     * Crée un embed de base avec la configuration du serveur
     */
    static create(guildId, data = {}) {
        const guildConfig = ConfigModel.getAll(guildId);

        const embed = new EmbedBuilder();

        // Couleur
        if (data.color) {
            embed.setColor(data.color);
        } else {
            embed.setColor(guildConfig.embed_color || config.defaultEmbedColor);
        }

        // Titre
        if (data.title) {
            embed.setTitle(data.title);
        } else if (guildConfig.embed_title) {
            embed.setTitle(guildConfig.embed_title);
        }

        // Description
        if (data.description) {
            embed.setDescription(data.description);
        } else if (guildConfig.embed_description) {
            embed.setDescription(guildConfig.embed_description);
        }

        // Footer
        const footerText = data.footer || guildConfig.embed_footer || config.defaultFooterText;
        const footerIcon = data.footerIcon || guildConfig.embed_footer_icon || null;
        if (footerIcon) {
            embed.setFooter({ text: footerText, iconURL: footerIcon });
        } else {
            embed.setFooter({ text: footerText });
        }

        // Timestamp
        if (data.timestamp !== false) {
            embed.setTimestamp();
        }

        // Image
        if (data.image) {
            embed.setImage(data.image);
        } else if (guildConfig.embed_image) {
            embed.setImage(guildConfig.embed_image);
        }

        // Thumbnail
        if (data.thumbnail) {
            embed.setThumbnail(data.thumbnail);
        } else if (guildConfig.embed_thumbnail) {
            embed.setThumbnail(guildConfig.embed_thumbnail);
        }

        // Author
        if (data.author) {
            embed.setAuthor({
                name: data.author.name,
                iconURL: data.author.iconURL,
                url: data.author.url
            });
        }

        // Fields
        if (data.fields && Array.isArray(data.fields)) {
            data.fields.forEach(field => {
                embed.addFields({
                    name: field.name,
                    value: field.value,
                    inline: field.inline || false
                });
            });
        }

        return embed;
    }

    /**
     * Embed de succès
     */
    static success(guildId, title, description) {
        return this.create(guildId, {
            title: `✅ ${title}`,
            description,
            color: '#00FF00'
        });
    }

    /**
     * Embed d'erreur
     */
    static error(guildId, title, description) {
        return this.create(guildId, {
            title: `❌ ${title}`,
            description,
            color: '#FF0000'
        });
    }

    /**
     * Embed d'information
     */
    static info(guildId, title, description) {
        return this.create(guildId, {
            title: `ℹ️ ${title}`,
            description,
            color: '#3498DB'
        });
    }

    /**
     * Embed d'avertissement
     */
    static warning(guildId, title, description) {
        return this.create(guildId, {
            title: `⚠️ ${title}`,
            description,
            color: '#FFA500'
        });
    }

    /**
     * Embed de ticket
     */
    static ticket(guildId, data) {
        const service = data.service || {};
        const priorityColors = {
            'Normal': '#3498DB',
            'Important': '#FFA500',
            'Urgent': '#FF0000'
        };

        return this.create(guildId, {
            title: `${service.emoji || '📋'} Ticket #${data.ticketNumber}`,
            description: data.description || '',
            color: priorityColors[data.priority] || service.color || config.defaultEmbedColor,
            fields: data.fields || [],
            author: data.author ? {
                name: data.author.name,
                iconURL: data.author.iconURL
            } : null
        });
    }

    /**
     * Embed de déploiement
     */
    static deploy(guildId) {
        const description = `Clique sur le bouton correspondant à ton besoin. Un salon privé sera créé : toi et l'équipe concernée y serez les seuls à voir la discussion.

🔸 **Directeur**
▫️ Demandes relevant de la direction

🔸 **Directeur adjoint**
▫️ Demandes relevant du directeur adjoint

🔸 **Chef de police**
▫️ Échanges avec le chef de police

🔸 **Chef de service — classe 1**
▫️ Échanges avec un chef de service (classe 1)

🔸 **Chef de service — classe 2**
▫️ Échanges avec un chef de service (classe 2)

🔸 **BMO brigade motorisée urbaine**
▫️ Candidature, suivi et questions recrutement BMO brigade motorisée urbaine

🔸 **GSI・Groupe de soutien et d'intervention**
▫️ Candidature, suivi et questions recrutement (groupe de soutien et de sécurité)

🔸 **Suggestion police municipale**
▫️ Idée d'amélioration, retour constructif (hors signalement disciplinaire)

🔸 **Rapport**
▫️ Signalement ou remontée nécessitant traitement staff (détails, preuves)

🔸 **Démission**
▫️ Démarche de départ, derniers échanges avec le staff concerné

🔸 **Plainte**
▫️ Plainte formelle à traiter par l'équipe habilitée`;

        const embed = new EmbedBuilder()
            .setTitle('🎫 Contactez le service')
            .setDescription(description)
            .setColor('#1E3A5F')
            .setFooter({ text: 'Police Municipale RH' })
            .setTimestamp();

        return embed;
    }
}

module.exports = EmbedUtils;
