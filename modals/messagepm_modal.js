const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'messagepm_modal_',

    async execute(interaction, client) {
        const channelId = interaction.customId.replace('messagepm_modal_', '');
        const title = interaction.fields.getTextInputValue('message_title');
        const message = interaction.fields.getTextInputValue('message_content');
        const color = interaction.fields.getTextInputValue('message_color') || '#1a1a2e';

        try {
            const channel = await client.channels.fetch(channelId);
            if (!channel) {
                return interaction.reply({ content: '❌ Salon introuvable.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(message)
                .setColor(color)
                .setFooter({ text: `${interaction.guild.name} RH` })
                .setTimestamp();

            await channel.send({ embeds: [embed] });

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
