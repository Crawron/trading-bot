import { CommandGroup } from "../../slasher"
import { addPlayerCommand } from "./addPlayerCommand"
import { hitlistsCommand } from "./hitlistsCommand"
import { populateCommand } from "./populateCommand"
import { roundCommand } from "./roundCommand"

export const hostGroup = new CommandGroup(
	"host",
	{ roles: [process.env.HOSTROLEID!] },
	addPlayerCommand,
	populateCommand,
	roundCommand,
	hitlistsCommand
)
