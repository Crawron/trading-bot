import { CommandGroup } from "../../slasher"
import { addPlayerCommand } from "./addPlayerCommand"
import { giveCommand } from "./giveCommand"
import { hitlistsCommand } from "./hitlistsCommand"
import { playerCommand } from "./playerCommand"
import { populateCommand } from "./populateCommand"
import { roundCommand } from "./roundCommand"

export const hostGroup = new CommandGroup(
	"host",
	{ roles: [process.env.HOSTROLEID!] },
	addPlayerCommand,
	populateCommand,
	roundCommand,
	hitlistsCommand,
	playerCommand,
	giveCommand
)
