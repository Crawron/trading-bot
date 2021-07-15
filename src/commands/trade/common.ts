import * as Eris from "eris"
import { channelOpt } from "../../slasher"
import { game } from "../../Game"
import { Player } from "../../Player"
import { playersInChannel } from "../common"

/** Finds the recipient player, given a pair channel id and one players's id */
export function solveTriangle(playerId: string, channel: Eris.TextChannel) {
	if (channel.parentID === process.env.TRADEIGNORECATEGORYID!) return

	const otherPlayers = playersInChannel(channel)
	if (otherPlayers.length !== 2) return

	const [playerA, playerB] = otherPlayers

	return playerId === playerA.id ? playerB! : playerA
}
