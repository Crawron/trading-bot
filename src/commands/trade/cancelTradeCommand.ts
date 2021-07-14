import { Command } from "slasher"
import { getTradeEmbed } from "../../embeds"
import { game } from "../../Game"
import { solveTriangle } from "./common"

export const cancelTradeCommand = new Command(
	"cancel",
	"Cancel a pending trade with this player",
	{
		action: async (int) => {
			if (!game.inProgress)
				return int.reply("The game has not started yet", true)
			if (!game.isPlayer(int.member.id))
				return int.reply("Only players may use this command", true)

			const playerA = game.getPlayer(int.member.id)
			const playerB = solveTriangle(playerA.id, int.channel)

			if (!playerB)
				return int.reply("You can only use this command in a pair chat.", true)

			const trade = game.pendingTradeBetween(playerA, playerB)

			if (!trade)
				return int.reply("There are no pending trades between you two", true)

			game.activeExchanges.delete(trade.id)

			int.reply(
				`Your trade has been cancelled. ${trade.dealer.member.mention} ${trade.recipient.member.mention}`
			)

			game.uploadExchanges()
		},
	}
)
