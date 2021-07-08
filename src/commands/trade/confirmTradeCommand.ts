import { Command } from "slasher"
import { ongoingTrades } from "./tradeGroup"

export const confirmTradeCommand = new Command(
	"confirm",
	"confirm a pending trade",
	{
		action: async (int) => {
			const trade = ongoingTrades.get(int.channel.id)
			if (!trade) {
				int.reply("There's no ongoing trade in this channel.", true)
				return
			}

			if (trade.pendingPart) {
				int.reply(
					`This trade is not yet complete! Waiting for ${"TODO"} side of the trade.`,
					true
				)
				return
			}

			trade.pendingConfirm = trade.pendingConfirm.filter(
				(p) => p !== int.member.user.id
			)

			ongoingTrades.set(int.channel.id, trade)

			if (trade.pendingConfirm.length === 0) {
				int.reply(`Confirmed and registered! Thanks!`)
				ongoingTrades.delete(int.channel.id)

				if (trade.isCompletelyEmpty)
					int.followUp(
						"I can't believe someone actually did this. You have actually wasted a trade and we will *not* give it back to you. This is the price of comedy."
					)
			} else {
				int.reply(`Confirmed! Waiting for the other side to confirm.`, true)
			}
		},
	}
)
