/**
 * Button: dispatch_present
 * Agent marqué présent
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { responses, setAndSave, saveResponse } = require('../utils/dispatchTracker');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'dispatch_present',

    async execute(interaction, client) {
        const userId = interaction.user.id;
        const messageId = interaction.message.id;

        if (!responses.has(messageId)) {
            setAndSave(messageId, { present: [], retard: [], absent: [], channelId: interaction.channel.id, guildId: interaction.guild.id, dispatchDate: new Date().toISOString().slice(0, 10) });
        }

        const data = responses.get(messageId);

        // Retirer des autres catégories
        data.present = data.present.filter(id => id !== userId);
        data.retard = data.retard.filter(id => id !== userId);
        data.absent = data.absent.filter(id => id !== userId);

        // Ajouter
        if (!data.present.includes(userId)) {
            data.present.push(userId);
        }

        saveResponse(messageId, data);

        // Mettre à jour les boutons avec les compteurs
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('dispatch_present')
                .setLabel(`Présent (${data.present.length})`)
                .setStyle(ButtonStyle.Success)
                .setEmoji('🟢'),
            new ButtonBuilder()
                .setCustomId('dispatch_retard')
                .setLabel(`Retard (${data.retard.length})`)
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🟠'),
            new ButtonBuilder()
                .setCustomId('dispatch_absent')
                .setLabel(`Absent (${data.absent.length})`)
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔴')
        );

        try {
            await interaction.message.edit({ components: [row] });
        } catch (e) {}

        await interaction.reply({
            content: '✅ Vous êtes marqué **Présent**.',
            ephemeral: true
        });

        Logger.info(`${interaction.user.tag} marqué présent au dispatch`);
    }
};
