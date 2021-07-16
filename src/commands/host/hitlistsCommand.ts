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
				name: `${p.name}${p.dead ? " 🩸" : ""}`,
				value:
					p.hitList
						.map(game.getPlayerNameFromId)
						.map((n, i) => `\`${i + 1}\` ${n}`)
						.join("\n") || "_Empty_",
				inline: true,
			}))

			const embed = new RichEmbed({ fields: hitlists })
				.image("https://via.placeholder.com/360x1/2f3136/2f3136")
				.description("Everyone's hitlists")
				.color(colors.digory).raw

			const theresPlayers = playersInChannel(int.channel).length > 0
			int.reply(undefined, theresPlayers, embed)
		},
	}
)
