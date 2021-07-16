import { Command } from "../slasher"
import { playerInfoEmbed } from "../embeds"
import { game } from "../Game"
import { checkGameAndPlayer } from "./common"

export const inventoryCommand = new Command(
	"inventory",
	"Displays your Hit List and oblivion",
	{
		permissions: { roles: [process.env.PLAYERROLEID!] },
		action: async (int) => {
			if (!checkGameAndPlayer(int)) return

			const player = game.getPlayer(int.member.id)
			int.reply(undefined, true, playerInfoEmbed(player))
		},
	}
)
