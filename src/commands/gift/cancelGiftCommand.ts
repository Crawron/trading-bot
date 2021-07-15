import { Command } from "../../slasher"
import { getGiftEmbed, getIncomingGiftsEmbed } from "../../embeds"
import { game } from "../../Game"
import { errors } from "../../strings"
import { checkGameAndPlayer, thoughtChannelOf } from "../common"

export const cancelGiftCommand = new Command(
	"cancel",
	"Cancels your outgoing gift",
	{
		action: async (int) => {
			if (!checkGameAndPlayer(int)) return
			const player = game.getPlayer(int.member.id)

			// check if in thoughts channel
			if (thoughtChannelOf(player, int.guild)?.id !== int.channel.id)
				return int.reply(errors.thoughtsOnly, true)

			const gift = game
				.getAllExchangesInvolving(player)
				.find((e) => e.isGift && e.dealer.id === player.id)

			if (!gift) return int.reply("You are not giving any gifts", true)

			game.activeExchanges.delete(gift.id)

			int.reply(
				`You've cancelled a gift for ${gift.recipient.name}`,
				false,
				getGiftEmbed(gift, true)
			)

			const recipientChannel = thoughtChannelOf(gift.recipient, int.guild)
			if (!recipientChannel)
				throw new Error(`Couldn't find thoughts for ${gift.recipient.name}`)

			recipientChannel.createMessage({
				content: `${gift.recipient.member.mention}, ${gift.dealer.name} has cancelled their gift.`,
				embed: getIncomingGiftsEmbed(gift.recipient),
			})

			game.uploadExchanges()
		},
	}
)
