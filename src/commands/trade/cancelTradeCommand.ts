import { Command } from "slasher"
import { ongoingTrades } from "./tradeGroup"

export const cancelTradeCommand = new Command(
	"cancel",
	"Cancel an ongoing trade",
	{
		action: async (int) => {
			const trade = ongoingTrades.get(int.channel.id)

			if (!trade) {
				int.reply(
					"There's no ongoing trade in this channel. Use `/trade cancel` to cancel it"
				)
				return
			}

			ongoingTrades.delete(int.channel.id)
			int.reply("Trade has ben cancelled!")
		},
	}
)
