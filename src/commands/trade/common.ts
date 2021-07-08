import * as Eris from "eris"
import { game } from "../../Game"

/** Finds the recipient player, given a pair channel id and one players's id */
export async function solveTriangle(
	playerId: string,
	channel: Eris.TextChannel
) {
	if (channel.parentID === process.env.TRADEIGNORECATEGORYID!) return

	const otherPlayers = await playersInChannel(channel)
	if (otherPlayers.length !== 2) return

	const [playerA, playerB] = otherPlayers

	return playerId === playerA.id ? playerB! : playerA
}

async function playersInChannel(channel: Eris.TextChannel) {
	const players = channel.guild.members
		.filter(
			(m) =>
				channel.permissionsOf(m).has("readMessages") &&
				m.roles.includes(process.env.PLAYERROLEID!)
		)
		.map((m) => game.getPlayer(m.id))

	return players
}
