import { Command, integerOpt } from "slasher"
import { getMemberColor, RichEmbed } from "../../embeds"
import { game } from "../../Game"
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

			const gifts = getPlayerIncommingGifts(player)

			const embed = new RichEmbed()
				.color(getMemberColor(player.member))
				.author(player.name, player.member.avatarURL)
				.image("https://via.placeholder.com/360x1/2f3136/2f3136")
				.description(
					gifts
						.map((g, i) => `\`${i + 1}\` From **${g.dealer.name}**`)
						.join("\n") || "_None_"
				)

			if (gifts.length > 0)
				embed.footer("You can't gift while you have incoming gifts")

			int.reply(undefined, false, embed.raw)
		},
	}
)
