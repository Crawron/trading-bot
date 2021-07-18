import Eris = require("eris")
import { RichEmbed } from "../../embeds"
import { game } from "../../Game"
import { LogColor } from "../../logging"
import { Command, integerOpt, memberOpt } from "../../slasher"
import { em } from "../../strings"

export const giveCommand = new Command(
	"give",
	"Give an item to a player's inventory",
	{
		options: [
			memberOpt("player", "Player to give to", true),
			integerOpt("prestige", "Give Prestige"),
			integerOpt("oblivion", "Give Oblivion"),
			memberOpt("target", "A single Hit List Target. Mention a player"),
		],
		action: async (int) => {
			const member = await int.option<Eris.Member>("player")

			if (!game.isPlayer(member.id))
				return int.reply(`${member.username} is not a player.`)

			const player = game.getPlayer(member.id)

			const prestige = await int.option("prestige", 0)
			const oblivion = await int.option("oblivion", 0)
			const target = await int.option<Eris.Member | null>("target", null)

			if (prestige === 0 && oblivion === 0 && target === null)
				return int.reply("You dind't specify anything to give")

			player.vp += prestige
			player.tokens += oblivion
			if (target) player.addHitList(target.id)

			game.players.set(player.id, player)

			const embed = new RichEmbed()
				.description(
					`**${player.name}** gained **${prestige}** ${
						em.prestige
					}, **${oblivion}** ${em.oblivion}${
						target
							? `, **${game.getPlayerNameFromId(target.id)}** ${em.target}`
							: ""
					}`
				)
				.color(LogColor.Green).raw

			int.reply("Done!", false, embed)

			game.logGameInfo({
				embed,
			})

			game.uploadPlayers()
		},
	}
)
