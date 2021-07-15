import { Command, integerOpt } from "../../slasher"
import { getIncomingGiftsEmbed, getGiftEmbed } from "../../embeds"
import { game } from "../../Game"
import { errors } from "../../strings"
import { checkGameAndPlayer, thoughtChannelOf } from "../common"
import { getPlayerIncommingGifts } from "./common"

export const cancelGiftCommand = new Command(
	"cancel",
	"Cancels one of your gifts",
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

			game.uploadExchanges()
		},
	}
)
