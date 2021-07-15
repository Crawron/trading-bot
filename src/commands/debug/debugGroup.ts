import { CommandGroup } from "../../slasher"
import { databaseCommand } from "./databaseCommand"
import { fetchCommand, uploadCommand } from "./fetchUploadCommand"
import { setvarCommand } from "./setvarCommand"
import { varsCommand } from "./varsCommand"

export const debugGroup = new CommandGroup(
	"debug",
	{ users: [process.env.BOTOWNER!, "141189864287633408" /*Reds*/] },
	databaseCommand,
	varsCommand,
	fetchCommand,
	uploadCommand,
	setvarCommand
)
