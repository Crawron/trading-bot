import { Command } from "slasher"
import { game } from "../../Game"
import { solveTriangle } from "./common"

export const confirmTradeCommand = new Command(
	"confirm",
	"Confirm a pending trade",
	{
		action: async (int) => {
			if (!game.inProgress)
				return int.reply("The game hasn't started yet", true)

			if (!game.isPlayer(int.member.id))
				return int.reply("Only players can use this", true)
			const recipient = solveTriangle(int.member.id, int.channel)

			if (!recipient)
				return int.reply("You can only use this command in pair chats", true)

			const dealer = game.getPlayer(int.member.id)

			const trade = game.pendingTradeBetween(dealer, recipient)
			if (!trade) {
				int.reply("There's no ongoing trade in this channel.", true)
				return
			}

			if (!trade.recipientGive)
				return int.reply(
					`${trade.recipient.name} hasn't decided their part, they must \`/trade part\``
				)

			if (trade.dealer.id !== dealer.id)
				return int.reply(
					`You aren't the dealer of this trade. You must wait for **${dealer.name}**`
				)

			const dealerCheck = trade.dealer.canGive(trade.dealerGive!)
			if (typeof dealerCheck === "string") return int.reply(dealerCheck, true)

			const recipientCheck = trade.recipient.canGive(trade.recipientGive!)
			if (typeof recipientCheck === "string")
				return int.reply(recipientCheck, true)

			const { tradeResult } = trade

			dealer.hitList = tradeResult.dealer.hitlist
			dealer.tokens = tradeResult.dealer.tokens

			recipient.hitList = tradeResult.recipient.hitlist
			recipient.tokens = tradeResult.recipient.tokens

			dealer.remainingTrades -= 1
			recipient.remainingTrades -= 1

			game.players.set(dealer.id, dealer)
			game.players.set(recipient.id, recipient)

			game.activeExchanges.delete(trade.id)

			int.reply("Trade complete! Thank you ♥")

			if (trade.isCompletelyEmpty)
				int.followUp(
					"I can't believe someone actually did this. You have actually wasted a trade and we will *not* give it back to you. This is the price of comedy."
				)

			await game.uploadExchanges()
			await game.uploadPlayers()
		},
	}
)
