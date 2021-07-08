import { Command } from "slasher"
import { game } from "../Game"

export const hitlistCommand = new Command("hitlist", "Displays your hitlist", {
	action: async (int) => {
		const player = game.getPlayer(int.member.id)
		const hlNames = player.hitList
			.map((hlid, i) => `**${i + 1}.** ${game.getPlayer(hlid).name}`)
			.join("\n")

		int.reply(`Your hitlist:\n${hlNames}`, true)
	},
})
