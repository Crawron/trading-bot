import * as Eris from "eris"
import { Command, integerOpt, memberOpt, stringOpt } from "slasher"
import { getGiftEmbed } from "../../embeds"
import { Exchange } from "../../Exchange"
import { game } from "../../Game"
import { errors } from "../../strings"
import { checkGameAndPlayer } from "../common"
import { thoughtChannelOf } from "../trade/common"

export const startGiftCommand = new Command(
	"start",
	"Initiate a gift for another player",
	{
		options: [
			memberOpt("player", "Who will recieve this gift?", true),
			stringOpt("hitlist", "Hit List items to give"),
			integerOpt("oblivion", "Amount of oblivion to give"),
		],
		action: async (int) => {
			if (!checkGameAndPlayer(int)) return

			const dealer = game.getPlayer(int.member.id)

			// check if in thoughts channel
			const dealerThoughts = thoughtChannelOf(dealer, int.guild)

			console.log({ thoughts: dealerThoughts?.id, intention: int.channel.id })

			if (dealerThoughts?.id !== int.channel.id)
				return int.reply(errors.thoughtsOnly, true)

			if (game.hasOutstanding(dealer))
				return int.reply(
					"You have pending exchanges where you have given a part. You must wait for them to be resolved before giving a gift. (`/pending`)",
					true
				)

			// can't make new gifts if they have a pending gift incoming
			const pendingInGifts = game
				.getAllExchangesInvolving(dealer)
				.find((e) => e.isGift && e.recipient.id === dealer.id)

			if (pendingInGifts) return

			const targetMember = await int.option<Eris.Member>("player")
			if (!game.isPlayer(targetMember.id))
				return int.reply(`${targetMember.mention} is not a player`, true)

			const hitlistStr = await int.option("hitlist", "")

			const hitlistIndices = hitlistStr
				? hitlistStr.split(",").map((e) => parseInt(e.trim()) - 1)
				: []

			if (hitlistIndices.some(isNaN))
				return int.reply(errors.hitlistIndex, true)

			if (hitlistIndices.some((i) => i < 0 || i >= dealer.hitList.length))
				return int.reply(errors.outOfList, true)

			const hitlist = hitlistIndices.map((i) => dealer.hitList[i])
			const tokens = await int.option("oblivion", 0)

			if (hitlist.length === 0 && tokens === 0)
				return int.reply("You cannot give an empty gift", true)

			const dealerCanGive = dealer.canGive({ hitlist, tokens })
			if (dealerCanGive !== true) return int.reply(dealerCanGive, true)

			const recipient = game.getPlayer(targetMember.id)

			const gift = new Exchange(
				game.activeExchanges.size.toString(),
				dealer,
				recipient,
				true,
				game.vars.get("round") as number
			)

			const dealerCheck = gift.dealerGives({ hitlist, tokens })
			if (typeof dealerCheck === "string") return int.reply(dealerCheck, true)

			gift.recipientGives({ hitlist: [], tokens: 0 })

			game.activeExchanges.set(gift.id, gift)
			game.uploadExchanges()

			int.reply(undefined, false, getGiftEmbed(gift))

			const recipientChannel = thoughtChannelOf(recipient, int.guild)
			if (!recipientChannel)
				throw new Error(`Couldn't find thoughts for ${recipient.name}`)

			recipientChannel.createMessage(
				`${recipient.member.mention}, you've recieved a gift from ${dealer.member.mention}, you don't know what it contains. \nYou may \`/gift accept\` it or \`/gift decline\` it.`
			)
		},
	}
)
