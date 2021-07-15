import { CommandGroup } from "slasher"
import { pendingGiftCommand } from "./pendingGiftCommand"
import { startGiftCommand } from "./startGiftCommand"

export const giftGroup = new CommandGroup(
	"gift",
	undefined,
	startGiftCommand,
	pendingGiftCommand
)
