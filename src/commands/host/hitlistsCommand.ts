import { RichEmbed } from "../../embeds"
import { game } from "../../Game"
import { Command } from "../../slasher"
import { colors } from "../../strings"
import { playersInChannel } from "../common"

export const hitlistsCommand = new Command(
	"hitlists",
	"Displays hitlists from all players",
	{
		action: async (int) => {
			const hitlists = [...game.players.values()].map((p) => ({
				name: p.name,
				value:
					p.hitList
						.map(game.getPlayerNameFromId)
						.map((n, i) => `\`${i + 1}\` ${n}`)
						.join("\n") || "_Empty_",
			}))

			const embed = new RichEmbed({ fields: hitlists })
				.description("Everyone's hitlists")
				.color(colors.digory).raw

			const theresPlayers = playersInChannel(int.channel).length > 0
			int.reply(undefined, theresPlayers, embed)
		},
	}
)
