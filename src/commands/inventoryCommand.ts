import { Command } from "slasher"
import { playerInfoEmbed } from "../embeds"
import { game } from "../Game"
import { errors } from "../strings"

export const inventoryCommand = new Command(
	"inventory",
	"Displays your Hit List and oblivion",
	{
		action: async (int) => {
			if (!game.isPlayer(int.member.id)) return int.reply(errors.playerOnly)

			const player = game.getPlayer(int.member.id)
			int.reply(undefined, true, playerInfoEmbed(player))
		},
	}
)
