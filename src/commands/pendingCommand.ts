import { Command } from "../slasher"
import { pendingExchangesEmbed } from "../embeds"
import { Exchange } from "../Exchange"
import { game } from "../Game"
import { checkGameAndPlayer } from "./common"

export const pendingCommand = new Command(
	"pending",
	"See all your pending exchanges.",
	{
		permissions: { roles: [process.env.PLAYERROLEID!] },
		action: async (int) => {
			if (!checkGameAndPlayer(int)) return

			const player = game.getPlayer(int.member.id)

			int.reply(undefined, true, pendingExchangesEmbed(player))
		},
	}
)
