import { CommandGroup } from "../../slasher"
import { giveCommand } from "../host/giveCommand"
import { cancelTradeCommand } from "./cancelTradeCommand"
import { confirmTradeCommand } from "./confirmTradeCommand"
import { partTradeCommand } from "./partTradeCommand"
import { pendingTradeCommand } from "./pendingTradeCommand"
import { startTradeCommand } from "./startTradeCommand"

export const tradeGroup = new CommandGroup(
	"trade",
	{ roles: [process.env.PLAYERROLEID!] },
	startTradeCommand,
	partTradeCommand,
	confirmTradeCommand,
	pendingTradeCommand,
	cancelTradeCommand,
	giveCommand
)
