import Eris = require("eris")
import { WebhookMessageEmbed } from "slasher/src/ApiTypes"
import { Exchange } from "./Exchange"
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

export function getTradeEmbed(trade: Exchange): WebhookMessageEmbed {
	const recipientPart =
		trade.recipientGive &&
		`**Hit list items** ${game.getPlayerIdName(
			...(trade.recipientGive?.hitlist ?? [])
		)}\n**${
			trade.recipientGive?.tokens || "No"
		} Tokens** ${"<:LunarCoin:623550952028241921>".repeat(
			trade.recipientGive?.tokens ?? 0
		)}`

	return {
		type: `rich`,
		title: `Trade between **${trade.dealer.name}** **\\↔** **${trade.recipient.name}**`,
		color: 14130143,
		fields: [
			{
				name: `${trade.dealer.name} gives`,
				value: `**Hit list items** ${game.getPlayerIdName(
					...(trade.dealerGive?.hitlist ?? [])
				)}\n**${
					trade.dealerGive?.tokens || "No"
				} Tokens** ${"<:LunarCoin:623550952028241921>".repeat(
					trade.dealerGive?.tokens ?? 0
				)}`,
				inline: true,
			},
			{
				name: `${trade.recipient.name} gives`,
				value: recipientPart ?? "*Pending...*",
				inline: true,
			},
		].concat(
			(trade.isComplete && [
				{
					name: "Trade Ready!",
					value: `This trade is complete, **${trade.dealer.name}** must confirm with \`/trade confirm\`. Either side can \`/trade cancel\``,
					inline: false,
				},
			]) || [
				{
					name: "Recipient Pending",
					value: `**${trade.recipient.name}** is missing their part of the trade. They must either \`/trade part\` or \`/trade cancel\``,
					inline: false,
				},
			]
		),
	}
}
