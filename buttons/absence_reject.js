const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const AbsenceModel = require('../models/Absence');
const Logger = require('../utils/logger');

module.exports = {
    customId: 'absence_reject_',

    async execute(interaction, client) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '❌ Vous n\'avez pas les permissions.', ephemeral: true });
        }

        const absenceId = interaction.customId.replace('absence_reject_', '');
        const absence = AbsenceModel.getById(absenceId);

        if (!absence) {
            return interaction.reply({ content: '❌ Absence introuvable.', ephemeral: true });
        }

        AbsenceModel.reject(absenceId, interaction.user.id);

        const embed = EmbedBuilder.from(interaction.message.embeds[0]);
        embed.setColor('#FF0000');
        embed.setFooter({ text: `❌ Refusé par ${interaction.user.tag}` });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`absence_approve_${absenceId}`)
                .setLabel('Accepter')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅')
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId(`absence_reject_${absenceId}`)
                .setLabel('Refusé')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌')
                .setDisabled(true)
        );

        await interaction.update({ embeds: [embed], components: [row] });

        // Notify user
        try {
            const user = await client.users.fetch(absence.user_id);
            if (user) {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('❌ Absence refusée')
                    .setDescription(
                        `Votre demande d'absence a été **refusée**.\n\n` +
                        `> 📅 **Début** ・ \`${absence.start_date}\`\n` +
                        `> 📅 **Fin** ・ \`${absence.end_date}\``
                    )
                    .setColor('#FF0000');
                await user.send({ embeds: [dmEmbed] });
            }
        } catch (e) {}

        Logger.info(`Absence #${absenceId} refusée par ${interaction.user.tag}`);
    }
};
