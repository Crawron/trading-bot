import Eris = require("eris")
import { booleanOpt, Command, integerOpt } from "../../slasher"
import { game } from "../../Game"

export const roundCommand = new Command(
	"round",
	"Set the game round. Or pause game commands by setting the round to 0",
	{
		options: [
			integerOpt("round", "Which round", true),
			booleanOpt(
				"announce",
				"Whether to alert each channel of the round change (Ignored when round: 0)"
			),
		],
		action: async (int) => {
			int.defer()

			const round = await int.option<number>("round")
			const announce = await int.option("announce", false)

			const textChannels = int.guild.channels.filter(
				(c) => c.type === Eris.Constants.ChannelTypes.GUILD_TEXT
			) as Eris.TextChannel[]

			if (round > 0 && announce)
				for (const channel of textChannels)
					channel.createMessage(
						`:sparkles::star: **Start of Round ${round}** :star::sparkles:`
					)

			game.vars.set("round", round)
			await game.uploadVars()

			int.editReply(`Got it! ${round < 1 ? "Game stopped" : `Round ${round}`}`)
		},
	}
)
