const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Permet de setup le bot'),

    async execute(interaction){
        // Récupération de la bannière du bot (fetch)
        const bot = interaction.client;

        const bot_fetch = await bot.user.fetch();
        const banniere_client = bot_fetch.banner ? bot_fetch.bannerURL({ size: 512, dynamic: true }) : null;
    }
}