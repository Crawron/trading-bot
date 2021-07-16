import * as Eris from "eris"
import { getMemberColor, RichEmbed } from "../../embeds"
import { game } from "../../Game"
import { Command, memberOpt } from "../../slasher"
import { emoji } from "../../strings"
import { playersInChannel } from "../common"

export const playerCommand = new Command(
	"player",
	"Display all info about a player",
	{
		options: [memberOpt("player", "Player", true)],
		action: async (int) => {
			const member = await int.option<Eris.Member>("player")
			if (!game.isPlayer(member.id))
				return int.reply(`${member.username} is not a player.`)

			const player = game.getPlayer(member.id)

			const playerExchanges = game.getAllExchangesInvolving(player)
			const trades = playerExchanges.filter((e) => !e.isGift)
			const gifts = playerExchanges.filter((e) => e.isGift)

			const embed = new RichEmbed()
				.color(getMemberColor(member))
				.image("https://via.placeholder.com/360x1/2f3136/2f3136")
				.author(player.name, player.member.avatarURL)
				.field(
					"Prestige",
					`**${player.vp - player.tokens}** (${player.vp} - ${player.tokens}${
						emoji.oblivion
					})`,
					true
				)
				.field(
					"Oblivion",
					`**${player.tokens}** ${emoji.oblivion.repeat(player.tokens)}`,
					true
				)
				.field(
					"Status",
					player.dead ? ":drop_of_blood: *Wounded*" : "*Alive*",
					true
				)
				.field(
					"Hit List",
					(player.hitList
						.map(game.getPlayerNameFromId)
						.map((n, i) => `\`${i + 1}\` ${n}`)
						.join("\n") || "*Empty*") +
						(player.dead
							? "\n\n🩸 _You're wounded! Your Hit List has been emptied. You can still recieve Hit List Targets from other players._"
							: ""),
					false
				)
				.field(
					"Pending Trades",
					trades
						.map(
							(t, i) =>
								`\`${i + 1}\` **${t.dealer.name} :left_right_arrow: ${
									t.recipient.name
								}**${t.hasGivenPart(player) ? " :warning:" : ""}`
						)
						.join("\n") || "_Empty_",
					true
				)
				.field(
					"Pending Gifts",
					gifts
						.map(
							(g, i) =>
								`\`${i + 1}\` **${g.dealer.name} :arrow_right: ${
									g.recipient.name
								}**${g.hasGivenPart(player) ? " :warning:" : ""}`
						)
						.join("\n") || "_Empty_",
					true
				)
				.field("Remaining Trades", `**${player.remainingTrades}**`, true)

			const theresPlayers = playersInChannel(int.channel).length > 0
			int.reply(undefined, theresPlayers, embed.raw)
		},
	}
)
