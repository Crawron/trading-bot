import { Command, integerOpt, stringOpt } from "slasher"
import { WebhookMessageEmbed } from "slasher/src/ApiTypes"
import { getTradeEmbed } from "../../embeds"
import { Exchange, ExchangeSide } from "../../Exchange"
import { game } from "../../Game"
import { solveTriangle } from "./common"

export const partTradeCommand = new Command(
	"part",
	"Continue an initiated trade",
	{
		options: [
			stringOpt(
				"hitlist",
				"Hitlist items to trade, comma separated. **Use the list index from /hitlist** (ex. hitlist: 1,2,6)"
			),
			integerOpt("tokens", "tokens"),
		],
		action: async (int) => {
			if (!game.inProgress) return int.reply("Wait until the game starts", true)

			if (!game.isPlayer(int.member.id))
				return int.reply("You must be a player to use this command.", true)

			const recipient = game.getPlayer(int.member.id)

			const dealer = await solveTriangle(int.member.id, int.channel)
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
					"You have pending exchanges where you have given a part. You must wait for them to be resolved before giving another part in a trade. (`/pending`)",
					true
				)

			const hitlistStr = (await int.parsedOptions()).get("hitlist") as
				| string
				| undefined

			const hitlist =
				hitlistStr
					?.split(",")
					.map((e) => e.trim())
					.map((e) => recipient.hitList[parseInt(e) - 1]) ?? []

			const tokens =
				((await int.parsedOptions()).get("tokens") as number | undefined) ?? 0

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
