import { CommandGroup } from "slasher"
import { confirmTradeCommand } from "./confirmTradeCommand"
import { partTradeCommand } from "./partTradeCommand"
import { pendingTradeCommand } from "./pendingTradeCommand"
import { startTradeCommand } from "./startTradeCommand"

export const tradeGroup = new CommandGroup(
	"trade",
	startTradeCommand,
	partTradeCommand,
	confirmTradeCommand,
	pendingTradeCommand
)
