import { CommandGroup } from "slasher"
import { acceptGiftCommand } from "./acceptGiftCommand"
import { cancelGiftCommand } from "./cancelGiftCommand"
import { declineGiftCommand } from "./declineGiftCommand"
import { pendingGiftCommand } from "./pendingGiftCommand"
import { startGiftCommand } from "./startGiftCommand"

export const giftGroup = new CommandGroup(
	"gift",
	{ roles: [process.env.PLAYERROLEID!] },
	startGiftCommand,
	pendingGiftCommand,
	acceptGiftCommand,
	declineGiftCommand,
	cancelGiftCommand
)
