import { Command, integerOpt } from "../../slasher"
import { getIncomingGiftsEmbed, getMemberColor, RichEmbed } from "../../embeds"
import { game } from "../../Game"
import { Player } from "../../Player"
import { errors } from "../../strings"
import { checkGameAndPlayer, thoughtChannelOf } from "../common"
import { getPlayerIncommingGifts } from "./common"

export const pendingGiftCommand = new Command(
	"pending",
	"All pending gifts *incoming*",
	{
		action: async (int) => {
			if (!checkGameAndPlayer(int)) return
			const player = game.getPlayer(int.member.id)

			// check if in thoughts channel
			const dealerThoughts = thoughtChannelOf(player, int.guild)

			if (dealerThoughts?.id !== int.channel.id)
				return int.reply(errors.thoughtsOnly, true)

			int.reply(undefined, false, getIncomingGiftsEmbed(player))
		},
	}
)
