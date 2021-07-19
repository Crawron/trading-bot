import { Command, integerOpt, memberOpt } from "../../slasher"
import { getGiftEmbed, getIncomingGiftsEmbed } from "../../embeds"
import { Exchange } from "../../Exchange"
import { game } from "../../Game"
import { errors } from "../../strings"
import { checkGameAndPlayer, thoughtChannelOf } from "../common"
import { getPlayerIncommingGifts } from "../gift/common"
import * as Eris from "eris"

export const acceptGiftCommand = new Command(
	"accept-gift",
	"Accepts an incoming gift for this player",
	{
		options: [
			memberOpt("player", "Player", true),
			integerOpt(
				"gift",
				"Gift to accept, referred to by its position in /gift pending (ex. gift:1)",
				true
			),
		],

		action: async (int) => {
			const member = await int.option<Eris.Member>("player")

			if (!game.isPlayer(member.id))
				return int.reply(`${member.username} is not a player`)
			const player = game.getPlayer(member.id)

			const gifts = getPlayerIncommingGifts(player)
			if (gifts.length === 0)
				return int.reply("No incoming gifts to accept", true)

			const giftPos = await int.option<number>("gift")

			if (giftPos < 1 || giftPos > gifts.length)
				return int.reply(
					`Gifts list only goes up to **${gifts.length}**`,
					true,
					getIncomingGiftsEmbed(player)
				)

			const gift = gifts[giftPos - 1]
			const result = gift.tradeResult

			const { dealer, recipient } = gift

			dealer.hitList = result.dealer.hitlist
			dealer.tokens = result.dealer.tokens

			recipient.hitList = result.recipient.hitlist
			recipient.tokens = result.recipient.tokens

			game.players.set(dealer.id, dealer)
			game.players.set(recipient.id, recipient)

			game.activeExchanges.delete(gift.id)

			int.reply(
				`Accepted ${gift.dealer.name}'s gift! :confetti_ball:`,
				false,
				getGiftEmbed(gift, true)
			)

			const dealersThoughts = thoughtChannelOf(dealer, int.guild)
			if (!dealersThoughts) throw new Error(`${dealer.name} no thoughts`)

			dealersThoughts.createMessage({
				content: `${dealer.member.mention}, ${recipient.name} has accepted your gift!`,
				embed: getGiftEmbed(gift),
			})

			game.logGameInfo({
				content: `A gift from **${gift.dealer.member.mention}** for **${gift.recipient.member.mention}** has been accepted`,
				embed: getGiftEmbed(gift, true),
			})

			game.uploadPlayers()
			game.uploadExchanges()
		},
	}
)
