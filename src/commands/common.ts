import { Interaction } from "slasher"
import { game } from "../Game"
import { errors } from "../strings"

/** Returns whether the check passes */
export function checkGameAndPlayer(int: Interaction): boolean {
	if (!game.inProgress) {
		int.reply(errors.gameStart, true)
		return false
	}
	if (!game.isPlayer(int.member.id)) {
		int.reply(errors.playerOnly, true)
		return false
	}

	return true
}
