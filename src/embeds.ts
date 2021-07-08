import Eris = require("eris")
import { WebhookMessageEmbed } from "slasher/src/ApiTypes"
import { game } from "./Game"
import { Player } from "./Player"

export function playerInfoEmbed(player: Player): WebhookMessageEmbed {
	const { id, name, tokens, member, vp, remainingTrades, dead, hitList } =
		player

	const embed: WebhookMessageEmbed = {
		type: "rich",
		title: name,
		thumbnail: { url: member.user.avatarURL },
		fields: [
			{ name: "VPs", value: `**${vp - tokens}** _(${vp} -${tokens}T)_` },
			{ name: "Remaining Trades", value: remainingTrades.toString() },
			{ name: "Status", value: dead ? "*Dead*" : "*Alive*" },
			{
				name: "HitList",
				value:
					hitList
						.map((e, i) => `**${i + 1}.** ${game.getPlayer(e)?.name ?? e}`)
						.join("\n") || "*Empty*",
			},
		],
		footer: { text: `ID ${id}` },
	}

	return embed
}
