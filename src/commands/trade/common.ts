import * as Eris from "eris"
import { channelOpt } from "slasher"
import { game } from "../../Game"
import { Player } from "../../Player"

/** Finds the recipient player, given a pair channel id and one players's id */
export function solveTriangle(playerId: string, channel: Eris.TextChannel) {
	if (channel.parentID === process.env.TRADEIGNORECATEGORYID!) return

	const otherPlayers = playersInChannel(channel)
	if (otherPlayers.length !== 2) return

	const [playerA, playerB] = otherPlayers

	return playerId === playerA.id ? playerB! : playerA
}

export function thoughtChannelOf(player: Player, guild: Eris.Guild) {
	const channels = guild.channels.filter(
		(c) => c.type === Eris.Constants.ChannelTypes.GUILD_TEXT
	) as Eris.TextChannel[]

	return channels
		.filter((c) => c.parentID !== process.env.TRADEIGNORECATEGORYID!)
		.filter((c) => playersInChannel(c).length === 1)
		.find((c) => playersInChannel(c).find((p) => p.id === player.id))
}

function playersInChannel(channel: Eris.TextChannel) {
	const players = channel.guild.members
		.filter(
			(m) =>
				channel.permissionsOf(m).has("readMessages") &&
				m.roles.includes(process.env.PLAYERROLEID!)
		)
		.map((m) => game.getPlayer(m.id))

	return players
}
