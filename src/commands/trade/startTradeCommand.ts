import Eris = require("eris")
import { Command, integerOpt, stringOpt } from "slasher"
import { getTradeEmbed } from "../../embeds"
import { game } from "../../Game"
import { Player } from "../../Player"
import { solveTriangle } from "./common"

export const startTradeCommand = new Command("start", "Initiate a new trade.", {
	options: [
		stringOpt(
			"hitlist",
			"Hitlist items to trade, comma separated. **Use the list index from /hitlist** (ex. hitlist: 1,2,6)"
		),
		integerOpt("tokens", "Anti-tokens to pass in the trade."),
	],

	action: async (int) => {
		if (!game.inProgress) return int.reply("Wait until the game starts", true)

		if (!game.isPlayer(int.member.id))
			return int.reply("You must be a player to use this command.", true)

		const dealer = game.getPlayer(int.member.id)
		const recipient = await solveTriangle(dealer.id, int.channel)

		if (!recipient)
			return int.reply(
				"You must call this command in a pair channel in order to trade with the other player",
				true
			)

		const pendingTrade = game.pendingTradeBetween(dealer, recipient)
		if (pendingTrade)
			return int.reply(
				`There is a pending trade between both you. You should continue it with \`/trade part\`, \`/trade confirm\` or \`/trade cancel\``,
				true,
				getTradeEmbed(pendingTrade)
			)

		if (dealer.remainingTrades <= 0)
			return int.reply(
				`${dealer.name}, you have ran out of trades for the game`
			)

		if (game.hasOutstanding(dealer))
			return int.reply(
				"You have pending exchanges where you have given a part. You must wait for them to be resolved before starting a new trade. (`/pending`)",
				true
			)

		const hitlistStr = (await int.parsedOptions()).get("hitlist") as
			| string
			| undefined

		const hitlist =
			hitlistStr
				?.split(",")
				.map((e) => e.trim())
				.map((e) => dealer.hitList[parseInt(e) - 1]) ?? []

		const tokens =
			((await int.parsedOptions()).get("tokens") as number | undefined) ?? 0

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
