/**
 * Modal: config_ticket_category_modal
 * Change la catégorie des tickets
 */

const ConfigModel = require('../models/Config');
const EmbedUtils = require('../utils/embedBuilder');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'config_ticket_category_modal',

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const categoryId = interaction.fields.getTextInputValue('config_ticket_category');

        // Vérifier que la catégorie existe
        const category = interaction.guild.channels.cache.get(categoryId);
        if (!category) {
            return interaction.reply({
                content: '❌ Catégorie introuvable.',
                ephemeral: true
            });
        }

        ConfigModel.set(guildId, 'ticket_category', categoryId);

        Logger.info(`Catégorie des tickets changée en ${category.name} par ${interaction.user.tag}`);

        const embed = EmbedUtils.success(guildId, '📁 Catégorie mise à jour', `La catégorie des tickets a été changée en **${category.name}**.`);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
