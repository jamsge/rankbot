const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const user = require('../functions/api/user')
const {ratingOrdinalToRank }= require('../functions/rating')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lookup')
		.setDescription('Quickly look up Slippi user info by connect code. Include the #!')
        .addStringOption(option => 
			option.setName('connect_code')
				.setDescription('Slippi user connect code. Remember to include the #!').setRequired(true))
		.addStringOption(option => 
			option.setName('visible_to')
				.setDescription('Who will this be visible to?')
				.addChoices(
					{name: "Only me", value: "only_me"},
					{name: "Everyone", value: "everyone"}
				)
		),
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
        const connectCode = interaction.options.getString('connect_code').replace(/ /g,'').toUpperCase();
        const poundIdx = connectCode.indexOf("#");
        if (poundIdx == -1){
            await interaction.reply({ 
				content: "**ERROR**: The # character must be used when using /lookup.",
				ephemeral: true
			});
			return;
        }
		const res = await user.getSlippiProfile(connectCode);
		const statusCode = res.status;
		if (statusCode !== 200){
			await interaction.reply({
				content: `**ERROR**: Something went wrong calling the Slippi API (got status code ${statusCode}).`,
				ephemeral: true
			});
			return;
		}
		if (!res.data.data.getConnectCode){
			await interaction.reply({
				content: `**ERROR**: No user found with connect code ${connectCode}`,
				ephemeral: true
			});
			return;
		}
		
		const profile = res.data.data.getConnectCode.user;

		console.log(profile);

		const profileEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle(`${profile.displayName}     [${profile.connectCode.code}]`)

		if (!profile.rankedNetplayProfile.wins && !profile.rankedNetplayProfile.losses){
			profileEmbed.setDescription("This user has no ranked data.");
			await interaction.reply({embeds: [profileEmbed], ephemeral: true});
			return;
		}

		// ALSO NEED CONDITIONAL FOR LESS THAN 5 GAMES PLAYED

		const wins = profile.rankedNetplayProfile.wins;
		const losses = profile.rankedNetplayProfile.losses;

		if (wins + losses < 5) {
			profileEmbed.setDescription("This user has no ranked data.");
			await interaction.reply({embeds: [profileEmbed], ephemeral: true});
			return;
		}

		const rating = profile.rankedNetplayProfile.ratingOrdinal;
		const dailyGlobalPlacement = profile.rankedNetplayProfile.dailyGlobalPlacement;
		const dailyRegionalPlacement = profile.rankedNetplayProfile.dailyRegionalPlacement;

		const rankedObj = ratingOrdinalToRank(rating, dailyGlobalPlacement, dailyRegionalPlacement);
		profileEmbed.setColor(rankedObj.color);

		const continent = profile.rankedNetplayProfile.continent
			.replace("_", " ")
			.toLowerCase()
			.split(" ")
			.map((s) => s.charAt(0).toUpperCase() + s.substring(1))
			.join(' ');
		const characters = profile.rankedNetplayProfile.characters.sort((a,b) => {
			var x = a.gameCount;
			var y = b.gameCount;
			return ((x < y) ? 1 : ((x > y) ? -1 : 0));
		})
		const totalGames = profile.rankedNetplayProfile.characters.reduce((acc, val) => {
			return acc + val.gameCount;
		}, 0);
		console.log(characters);

		const charactersText = characters.reduce((acc, val) => {
			const character = val.character
				.replace("_", " ")
				.toLowerCase()
				.split(" ")
				.map((s) => s.charAt(0).toUpperCase() + s.substring(1))
				.join(' ');

			return acc + character + ` (${((val.gameCount/totalGames) * 100).toFixed(1)}%)` + "\n";
		}, "")

		var d = "";
		var placementCount = 0;
		if (dailyRegionalPlacement){
			d += `${continent} #${dailyRegionalPlacement}`;
			placementCount++;
		}
		if (dailyGlobalPlacement){
			d += `Global #${dailyGlobalPlacement}`;
			placementCount++;
		}
		if (placementCount == 2){
			const g = d.indexOf("Global");
			profileEmbed.setDescription(d.substring(0, g) + "\n" + d.substring(g, d.length));
		} else if (placementCount == 1) {
			profileEmbed.setDescription(d);
		}

		profileEmbed
			.addFields(
				{ name: `**${rankedObj.name}**`, value: `**${rating.toFixed(2)}**`, inline:true},
				{ name: "Win / Loss (Win%)", value: `${wins} / ${losses} (${ ((wins/ (wins + losses)) * 100).toFixed(2) }%)`, inline:true},
				{ name: "Characters", value: charactersText}
			)
			.setThumbnail(rankedObj.imageLink)
			.setTitle(`${profile.displayName}\t[${profile.connectCode.code}]`)
			.setFooter({ text: ':D' });
		
		const visibility = interaction.options.getString("visible_to");
        await interaction.reply({embeds: [profileEmbed], ephemeral: !visibility || visibility == "only_me" ? true : false});
	},
};