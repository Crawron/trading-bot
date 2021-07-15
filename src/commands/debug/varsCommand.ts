import { game } from "../../Game"
import { Command } from "../../slasher"

export const varsCommand = new Command(
	"vars",
	"All game vars in incomprehensible format",
	{
		action: async (int) => {
			int.reply(`\`\`\`${JSON.stringify([...game.vars.entries()])}\`\`\``)
		},
	}
)
