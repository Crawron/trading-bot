import { Command, integerOpt } from "../../slasher"
import { getIncomingGiftsEmbed, getGiftEmbed } from "../../embeds"
import { game } from "../../Game"
import { errors } from "../../strings"
import { checkGameAndPlayer, thoughtChannelOf } from "../common"
import { getPlayerIncommingGifts } from "./common"

export const declineGiftCommand = new Command(
	"decline",
	"Declines an incoming gift",
	{
		options: [
			integerOpt(
				"gift",
				"Gift to decline, refered to by its position in /gifts pending (ex. gift:1)",
				true
			),
		],

		action: async (int) => {
			if (!checkGameAndPlayer(int)) return
			const player = game.getPlayer(int.member.id)

			// check if in thoughts channel
			if (thoughtChannelOf(player, int.guild)?.id !== int.channel.id)
				return int.reply(errors.thoughtsOnly, true)

			const gifts = getPlayerIncommingGifts(player)
			if (gifts.length === 0)
				return int.reply("You have no incoming gifts to decline", true)

			const giftPos = await int.option<number>("gift")

			if (giftPos < 1 || giftPos > gifts.length)
				return int.reply(
					`Your gifts list only goes up to **${gifts.length}**`,
					true,
					getIncomingGiftsEmbed(player)
				)

			const gift = gifts[giftPos - 1]
			const { dealer, recipient } = gift

			game.activeExchanges.delete(gift.id)

			int.reply(`You've declined ${gift.dealer.name}'s gift`)

			const dealersThoughts = thoughtChannelOf(dealer, int.guild)
			if (!dealersThoughts) throw new Error(`${dealer.name} no thoughts`)

			dealersThoughts.createMessage({
				content: `${dealer.member.mention}, ${recipient.name} has declined your gift`,
				embed: getGiftEmbed(gift, true),
			})

			game.uploadExchanges()
		},
	}
)
