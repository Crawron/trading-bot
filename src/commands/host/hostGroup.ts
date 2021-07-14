import { CommandGroup } from "slasher"
import { addPlayerCommand } from "./addPlayerCommand"
import { populateCommand } from "./populateCommand"

export const hostGroup = new CommandGroup(
	"host",
	{ roles: [process.env.HOSTROLEID!] },
	addPlayerCommand,
	populateCommand
)
