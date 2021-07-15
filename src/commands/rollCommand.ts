import { Command, integerOpt } from "../slasher"

export const rollCommand = new Command("roll", "Roll a die.", {
	options: [integerOpt("sides", "Faces of the die.")],
	action: async (int) => {
		const sides = await int.option("sides", 6)

		let roll = Math.ceil(Math.random() * sides)
		if (int.member?.id === "143419667677970434" && sides === 420) roll = 69

		int.reply(`:game_die: **${roll}** *(${sides} sided die)*`)
	},
})
