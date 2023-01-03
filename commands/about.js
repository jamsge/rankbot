const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('What is this bot?'),
	async execute(interaction) {
		await interaction.reply(
			{
				content: "RankBot was created by jams to easily view and track various Slippi Ranked stats.\nNext planned features include Discord Server leaderboards which server members can optionally join in on, and user rating trackers which will visualize rating changes over long stretches of time.",
				ephemeral: true
			});
	},
};