import { Command } from "slasher"
import { game } from "../../Game"
import { logInfo } from "../../logging"

export const fetchCommand = new Command(
	"fetch",
	"Force download database to uptade local data",
	{
		action: async (int) => {
			int.defer()
			await game.fetchData()
			logInfo("Forced data fetch")
			int.editReply("Done!")
		},
	}
)

export const uploadCommand = new Command(
	"upload",
	"Force upload local data to the database",
	{
		action: async (int) => {
			int.defer()
			await game.fetchData()
			logInfo("Forced data upload")
			int.editReply("Done!")
		},
	}
)
