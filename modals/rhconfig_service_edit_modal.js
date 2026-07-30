/**
 * Modal: rhconfig_service_edit_modal
 * Modifie un service
 */

const ServiceModel = require('../models/Service');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'rhconfig_service_edit_modal',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const serviceName = interaction.customId.split('_').slice(2, -1).join('_');

        const emoji = interaction.fields.getTextInputValue('service_emoji');
        const color = interaction.fields.getTextInputValue('service_color');
        const description = interaction.fields.getTextInputValue('service_description');

        // Valider la couleur
        if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
            return interaction.reply({
                content: '❌ Format de couleur invalide.',
                ephemeral: true
            });
        }

        try {
            ServiceModel.update(guildId, serviceName, {
                emoji,
                color,
                description
            });

            Logger.info(`Service "${serviceName}" modifié par ${interaction.user.tag}`);

            const embed = EmbedUtils.success(guildId, '🏷️ Service modifié', `Le service **${serviceName}** a été modifié avec succès.`);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            Logger.error('Erreur lors de la modification du service', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue.',
                ephemeral: true
            });
        }
    }
};
