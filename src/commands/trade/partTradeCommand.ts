import { Command, integerOpt, stringOpt } from "../../slasher"
import { getTradeEmbed, pendingExchangesEmbed } from "../../embeds"
import { ExchangeSide } from "../../Exchange"
import { game } from "../../Game"
import { solveTriangle } from "./common"

export const partTradeCommand = new Command(
	"part",
	"Continue an initiated trade",
	{
		options: [
			stringOpt(
				"hitlist",
				"Hitlist items to trade, comma separated. **Use the list index from /inventory** (ex. hitlist: 1,2,6)"
			),
			integerOpt("oblivion", "oblivion"),
		],
		action: async (int) => {
			if (!game.inProgress) return int.reply("Wait until the game starts", true)

			if (!game.isPlayer(int.member.id))
				return int.reply("You must be a player to use this command.", true)

			const recipient = game.getPlayer(int.member.id)

			const dealer = solveTriangle(int.member.id, int.channel)
			if (!dealer)
				return int.reply(
					"You must call this command in a pair channel in order to trade with the other player",
					true
				)

			const trade = game.pendingTradeBetween(dealer, recipient)
			if (!trade)
				return int.reply(
					"There's no ongoing trade between you two. You can start one with `\trade start`",
					true
				)

			if (trade.recipient.id !== int.member.id)
				return int.reply(
					`You aren't the recipient of this trade, wait for **${trade.recipient.name}**`,
					true,
					getTradeEmbed(trade)
				)

			if (recipient.remainingTrades < 0)
				return int.reply(
					`${recipient.name}, you have ran out of trades for the game`
				)

			if (trade.recipientGive !== undefined)
				return int.reply(
					`You have already given *and confirmed* your part of the trade, wait for **${trade.dealer.name}**`,
					true,
					getTradeEmbed(trade)
				)

			if (game.hasOutstanding(recipient))
				return int.reply(
					"You have pending exchanges where you have given a part. You must wait for them to be resolved before giving another part in a trade.",
					true,
					pendingExchangesEmbed(recipient)
				)

			const hitlistStr = await int.option("hitlist", "")

			const hitlistIndices = hitlistStr
				? hitlistStr.split(",").map((e) => parseInt(e.trim()) - 1)
				: []

			if (hitlistIndices.some((i) => isNaN(i)))
				return int.reply(
					"Write Hit List Targets by their position on your `/inventory`. (ex: `hitlist: 1,3`)",
					true
				)

			if (hitlistIndices.some((i) => i >= recipient.hitList.length || i < 0))
				return int.reply(
					"You've given a Hit List Target that's not your list",
					true
				)

			const hitlist = hitlistIndices.map((i) => recipient.hitList[i])

			const tokens = await int.option("oblivion", 0)

			const recipientCanGive = recipient.canGive({ hitlist, tokens })
			if (recipientCanGive !== true) return int.reply(recipientCanGive, true)
			// Recipient can't provide what they've offered.

			const result = trade.recipientGives({ hitlist, tokens })
			if (typeof result === "string") return int.reply(result)

			trade.recipientGive = trade.recipientGive as unknown as ExchangeSide

			int.reply(`<@${trade.dealer.id}>`, false, getTradeEmbed(trade))

			game.uploadExchanges()
		},
	}
)
