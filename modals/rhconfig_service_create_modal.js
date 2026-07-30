/**
 * Modal: rhconfig_service_create_modal
 * Crée un nouveau service
 */

const { ActionRowBuilder, TextInputBuilder, TextInputStyle, ModalBuilder } = require('discord.js');
const ServiceModel = require('../models/Service');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'rhconfig_service_create_modal',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        const name = interaction.fields.getTextInputValue('service_name');
        const emoji = interaction.fields.getTextInputValue('service_emoji');
        const color = interaction.fields.getTextInputValue('service_color');
        const categoryId = interaction.fields.getTextInputValue('service_category');
        const roleId = interaction.fields.getTextInputValue('service_role');
        const description = interaction.fields.getTextInputValue('service_description');

        // Valider la couleur
        if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
            return interaction.reply({
                content: '❌ Format de couleur invalide. Utilisez le format hexadécimal (#RRGGBB).',
                ephemeral: true
            });
        }

        // Valider les IDs
        if (!/^\d{17,19}$/.test(categoryId)) {
            return interaction.reply({
                content: '❌ ID de catégorie invalide.',
                ephemeral: true
            });
        }

        if (!/^\d{17,19}(;\d{17,19})*$/.test(roleId)) {
            return interaction.reply({
                content: '❌ ID de rôle invalide.',
                ephemeral: true
            });
        }

        // Vérifier si le service existe déjà
        const existing = ServiceModel.getByName(guildId, name);
        if (existing) {
            return interaction.reply({
                content: '❌ Un service avec ce nom existe déjà.',
                ephemeral: true
            });
        }

        try {
            const services = ServiceModel.getAll(guildId);
            const sortOrder = services.length + 1;

            ServiceModel.create({
                guild_id: guildId,
                name,
                emoji,
                color,
                description,
                category_id: categoryId,
                role_id: roleId,
                sort_order: sortOrder
            });

            Logger.info(`Service "${name}" créé par ${interaction.user.tag}`);

            const embed = EmbedUtils.success(guildId, '🏷️ Service créé', `Le service **${emoji} ${name}** a été créé avec succès.`);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            Logger.error('Erreur lors de la création du service', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue lors de la création du service.',
                ephemeral: true
            });
        }
    }
};
