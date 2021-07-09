import { CommandGroup } from "slasher"
import { Exchange } from "../../Exchange"
import { confirmTradeCommand } from "./confirmTradeCommand"
import { partTradeCommand } from "./partTradeCommand"
import { startTradeCommand } from "./startTradeCommand"

export const ongoingTrades = new Map<
	string,
	Exchange & { pendingConfirm: string[]; pendingPart: boolean }
>()

export const tradeGroup = new CommandGroup(
	"trade",
	startTradeCommand,
	partTradeCommand,
	confirmTradeCommand
)
