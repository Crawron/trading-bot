import { CommandGroup } from "slasher"
import { databaseCommand } from "./databaseCommand"
import { fetchCommand, uploadCommand } from "./fetchUploadCommand"
import { varsCommand } from "./varsCommand"

export const debugGroup = new CommandGroup(
	"debug",
	databaseCommand,
	varsCommand,
	fetchCommand,
	uploadCommand
)
