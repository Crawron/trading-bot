import Eris = require("eris")
import { Command, integerOpt, stringOpt } from "../../slasher"
import { getTradeEmbed, pendingExchangesEmbed } from "../../embeds"
import { game } from "../../Game"
import { Player } from "../../Player"
import { errors } from "../../strings"
import { checkGameAndPlayer } from "../common"
import { solveTriangle } from "./common"

export const startTradeCommand = new Command("start", "Initiate a new trade.", {
	options: [
		stringOpt(
			"hitlist",
			"Hitlist items to trade, comma separated. **Use the list index from /hitlist** (ex. hitlist: 1,2,6)"
		),
		integerOpt("oblivion", "Oblivion to pass in the trade."),
	],

	action: async (int) => {
		if (!checkGameAndPlayer(int)) return

		const dealer = game.getPlayer(int.member.id)
		const recipient = solveTriangle(dealer.id, int.channel)

		if (!recipient) return int.reply(errors.pairOnly, true)

		const pendingTrade = game.pendingTradeBetween(dealer, recipient)
		if (pendingTrade)
			return int.reply(errors.existentTrade, true, getTradeEmbed(pendingTrade))

		if (dealer.remainingTrades <= 0) return int.reply(errors.ranOut, true)

		if (game.hasOutstanding(dealer))
			return int.reply(
				"You have pending exchanges where you have given a part. You must wait for them to be resolved before starting a new trade.",
				true,
				pendingExchangesEmbed(dealer)
			)

		const hitlistStr = await int.option("hitlist", "")

		const hitlistIndices = hitlistStr
			? hitlistStr.split(",").map((e) => parseInt(e.trim()) - 1)
			: []

		if (hitlistIndices.some(isNaN)) return int.reply(errors.hitlistIndex, true)

		if (hitlistIndices.some((i) => i >= dealer.hitList.length || i < 0))
			return int.reply(errors.outOfList, true)

		const hitlist = hitlistIndices.map((i) => dealer.hitList[i])

		const tokens = await int.option("oblivion", 0)

		const dealerCanGive = dealer.canGive({ hitlist, tokens })
		if (dealerCanGive !== true) return int.reply(dealerCanGive, true)
		// Dealer can't provide what they've offered.

		// There are redundant safety checks in startTrade, maybe remove
		const tradeResult = game.startTrade(dealer, recipient, {
			hitlist,
			tokens,
		})

		if (typeof tradeResult === "string") return int.reply(tradeResult, true)

		await int.reply(
			`<@${recipient.id}>, **${dealer.name}** has initiated a trade with you`,
			false,
			getTradeEmbed(tradeResult)
		)

		game.uploadExchanges()
	},
})
