const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'messagepm_modal_',

    async execute(interaction, client) {
        const channelId = interaction.customId.replace('messagepm_modal_', '');
        const message = interaction.fields.getTextInputValue('message_content');

        try {
            const channel = await client.channels.fetch(channelId);
            if (!channel) {
                return interaction.reply({ content: '❌ Salon introuvable.', ephemeral: true });
            }

            await channel.send(message);

            await interaction.reply({
                content: `✅ Message envoyé dans ${channel} !`,
                ephemeral: true
            });
        } catch (error) {
            await interaction.reply({
                content: '❌ Erreur lors de l\'envoi du message.',
                ephemeral: true
            });
        }
    }
};
