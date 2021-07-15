import { game } from "../../Game"
import { Player } from "../../Player"

export function getPlayerIncommingGifts(player: Player) {
	return game
		.getAllExchangesInvolving(player)
		.filter((e) => e.isGift && e.recipient.id === player.id)
}
