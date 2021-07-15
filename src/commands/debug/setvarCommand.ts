import { Command, stringOpt } from "slasher"
import { game } from "../../Game"

export const setvarCommand = new Command(
	"setvar",
	"Set a game variable. Will replace if existent",
	{
		options: [
			stringOpt("name", "Variable name", true),
			stringOpt(
				"value",
				"Variable value. LEAVING EMPTY DESTROYS THE VAR WITHOUT MERCY"
			),
		],
		action: async (int) => {
			const key = await int.option<string>("name")
			const value = await int.option<string | null>("value", null)

			if (value) game.vars.set(key, value)
			else game.vars.delete(key)

			await game.uploadVars()

			int.reply("Done!")
		},
	}
)
