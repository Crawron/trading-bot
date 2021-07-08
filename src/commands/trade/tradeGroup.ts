import { CommandGroup } from "slasher"
import { Exchange } from "../../Exchange"
import { startTradeCommand } from "./startTradeCommand"

export const ongoingTrades = new Map<
	string,
	Exchange & { pendingConfirm: string[]; pendingPart: boolean }
>()

export const tradeGroup = new CommandGroup("trade", startTradeCommand)
