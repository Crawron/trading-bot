import Eris = require("eris")
import { Command, memberOpt } from "../../slasher"
import { playerInfoEmbed } from "../../embeds"
import { game } from "../../Game"

export const addPlayerCommand = new Command(
	"add-player",
	"Add a new player to the game",
	{
		options: [memberOpt("player", "Player to be added", true)],

		action: async (int) => {
			await int.defer()

			const playerMember = await int.option<Eris.Member>("player")

			const existingPlayer = [...game.players.values()].find(
				(p) => p.id === playerMember.id
			)

			if (existingPlayer) {
				int.editReply(
					"This player already exists",
					playerInfoEmbed(existingPlayer)
				)
				return
			}

			const newPlayer = await game.addPlayerFromMember(playerMember)
			int.editReply(`*Done! Registered*`, playerInfoEmbed(newPlayer))
		},
	}
)
