import { Command, integerOpt, stringOpt } from "slasher"
import { game } from "../../Game"
import { solveTriangle } from "./common"
import { ongoingTrades } from "./tradeGroup"

export const partTradeCommand = new Command(
	"part",
	"Continue an initiated trade",
	{
		options: [
			stringOpt(
				"hitlist",
				"Your part of the hitlist trade. Mockup. write 'fail' to fail verification"
			),
			integerOpt("tokens", "tokens"),
		],
		action: async (int) => {
			if (!game.inProgress) return int.reply("Wait until the game starts")

			if (!game.isPlayer(int.member.id))
				return int.reply("You must be a player to use this command.")

			const recipient = game.getPlayer(int.member.id)

			const dealer = await solveTriangle(int.member.id, int.channel)
			if (!dealer)
				return int.reply(
					"You must call this command in a pair channel in order to trade with the other player"
				)

			const trade = game.pendingTradeBetween(dealer, recipient)
			if (!trade)
				return int.reply(
					"There's no ongoing trade between you two. You can start one with `\trade start`"
				)

			if (!(trade.recipient.id !== int.member.id))
				return int.reply(
					`You aren't the recipient of this trade, wait for ${trade.recipient.name} to give their \`/trade part\`, or \`trade cancel\``
				)

			const hitlist = (await int.parsedOptions()).get("hitlist") ?? "*none*"
			const tokens = (await int.parsedOptions()).get("tokens") ?? 0

			if (!trade.pendingPart) {
				int.reply(
					"Your side of the trade has already been submitted, use `/trade confirm`",
					true
				)
			}

			if (int.member.nick ?? int.member.username !== trade.recipientName) {
				int.reply(
					"You can't continue this trade, it's meant for someone else.",
					true
				)
				return
			}

			if (hitlist === "fail") {
				// verify validity PLACEHOLDER, TODO
				int.reply(
					`This trade isn't possible. You don't have \`this\` entry or whatever. Madeup message.`,
					true
				)
				return
			}

			// do the actual operations
			trade.recieveTokens = tokens
			trade.recieveHitlist = [hitlist]
			trade.pendingPart = false

			ongoingTrades.set(int.channel.id, trade)
			int.reply("Registered!", true)

			int.followUp(
				"Trade registered! Check details and **both** confirm with `/trade confirm`",
				false,
				{
					type: "rich",
					description: `\`\`\`json\n${JSON.stringify(
						trade,
						undefined,
						2
					)}\`\`\``,
				}
			)
		},
	}
)
