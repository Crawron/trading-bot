import * as Eris from "eris"

import { Interaction } from "slasher"
import { game } from "../Game"
import { Player } from "../Player"
import { errors } from "../strings"

export function thoughtChannelOf(player: Player, guild: Eris.Guild) {
	const channels = guild.channels.filter(
		(c) => c.type === Eris.Constants.ChannelTypes.GUILD_TEXT
	) as Eris.TextChannel[]

	return channels
		.filter((c) => c.parentID !== process.env.TRADEIGNORECATEGORYID!)
		.filter((c) => playersInChannel(c).length === 1)
		.find((c) => playersInChannel(c).find((p) => p.id === player.id))
}

export function playersInChannel(channel: Eris.TextChannel) {
	const players = channel.guild.members
		.filter(
			(m) =>
				channel.permissionsOf(m).has("readMessages") &&
				m.roles.includes(process.env.PLAYERROLEID!)
		)
		.map((m) => game.getPlayer(m.id))

	return players
}

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
