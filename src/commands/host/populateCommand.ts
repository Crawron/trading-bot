import { Command } from "../../slasher"

import { game } from "../../Game"
import { logInfo } from "../../logging"

export const populateCommand = new Command(
	"populate-hitlists",
	"(Clear and) Populate Hit Lists for all players",
	{
		action: async (int) => {
			int.defer()
			await game.populateHitlists()
			logInfo("Cleared and repopulated all HitLists")
			int.editReply("Done!")
		},
	}
)
