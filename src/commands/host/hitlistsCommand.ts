import { RichEmbed } from "../../embeds"
import { game } from "../../Game"
import { Command } from "../../slasher"
import { colors, emoji } from "../../strings"
import { playersInChannel } from "../common"

export const hitlistsCommand = new Command(
	"hitlists",
	"Displays hitlists from all players",
	{
		action: async (int) => {
			const hitlists = [...game.players.values()].map((p) => ({
				name: `${p.name} - ${p.dead ? "🩸 | " : ""}**${p.vp}** ${
					emoji.prestige
				} - **${p.tokens}** ${emoji.oblivion} | **${
					p.remainingTrades
				}** :shaking_hands:`,
				value:
					p.hitList
						.map(game.getPlayerNameFromId)
						.map((n, i) => `\`${i + 1}\` ${n}`)
						.join("\n") || "_Empty_",
				inline: true,
			}))

			const embed = new RichEmbed({ fields: hitlists })
				.title(`Everyone's Info`)
				.image("https://via.placeholder.com/360x1/2f3136/2f3136")
				.color(colors.digory)
				.footer(
					`Player Name (Wounded :drop_of_blood: |) Base Prestige ${emoji.prestige} - Oblivion ${emoji.oblivion} | Remiaining Trades :left_right_arrow: `
				).raw

			const theresPlayers = playersInChannel(int.channel).length > 0
			int.reply(undefined, theresPlayers, embed)
		},
	}
)
