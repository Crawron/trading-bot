import { Command } from "slasher"
import { Exchange } from "../Exchange"
import { game } from "../Game"

export const pendingCommand = new Command(
	"pending",
	"See all your pending exchanges.",
	{
		action: async (int) => {
			const exchanges = game.getAllExchangesInvolving(
				game.getPlayer(int.member.id)
			)

			let trades = exchanges.filter((e) => !e.isGift)
			let gifts = exchanges.filter((e) => e.isGift)
			let pending = exchanges.some(
				(e) => e.isComplete || e.dealer.id === int.member.id
			)

			const exchToString = (e: Exchange) =>
				`- ${e.dealer.name} → ${e.recipient.name}${
					e.isComplete || e.dealer.id === int.member.id ? "**\\***" : ""
				}`

			let exchangesList = ""

			if (trades.length)
				exchangesList += "**Trades**\n" + trades.map(exchToString).join("\n")

			if (gifts.length)
				exchangesList += "\n\n**Gifts**\n" + trades.map(exchToString).join("\n")

			if (!trades.length && !gifts.length)
				exchangesList +=
					"*You have no pending trades or gifts. You can start some with `/trade start` or `/gift start`*"

			if (pending)
				exchangesList +=
					"\n\n **\\*** = _You have given a part in this exchange, it must be resolved before you can give a part in any other exchange._"

			int.reply(exchangesList, true)
		},
	}
)
