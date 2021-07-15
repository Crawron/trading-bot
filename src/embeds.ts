import Eris = require("eris")
import { WebhookMessageEmbed } from "slasher/src/ApiTypes"
import { Exchange } from "./Exchange"
import { game } from "./Game"
import { listIndex } from "./helpers"
import { Player } from "./Player"
import { colors, emoji } from "./strings"

class RichEmbed {
	raw: WebhookMessageEmbed

	constructor(embed: Omit<WebhookMessageEmbed, "type"> = {}) {
		const { fields, ...theRest } = embed
		this.raw = { type: "rich", fields: fields ?? [], ...theRest }
	}

	author(name: string, iconUrl?: string, authorUrl?: string) {
		this.raw.author = { name, icon_url: iconUrl, url: authorUrl }
		return this
	}

	title(title: string) {
		this.raw.title = title
		return this
	}

	url(url: string) {
		this.raw.url = url
		return this
	}

	description(description: string) {
		this.raw.description = description
		return this
	}

	field(name: string, value: string, inline = false) {
		if (!name) throw new Error("`name` empty")
		if (!value) throw new Error("`value` empty")

		this.raw.fields = this.raw.fields!.concat([{ name, value, inline }])
		return this
	}

	image(url: string) {
		this.raw.image = { url }
		return this
	}

	thumbnail(url: string) {
		this.raw.thumbnail = { url }
		return this
	}

	footer(text: string, icon?: string) {
		this.raw.footer = { text, icon_url: icon }
		return this
	}

	color(color?: number) {
		this.raw.color = color
		return this
	}
}

export function playerInfoEmbed(player: Player): WebhookMessageEmbed {
	const { name, tokens, member, vp, remainingTrades, dead } = player

	const hitlist = player.dead
		? "🩸 _You're wounded! Your hit list will remain empty for the rest of the game. You can still recieve hit list items from other players, but they will be immediately deleted._"
		: listIndex(player.hitList.map(game.getPlayerNameFromId)) || `_Empty_`

	const embed = new RichEmbed()
		.author(name, member.user.avatarURL)
		.field(
			"Prestige",
			`**${vp - tokens}** (${vp} - ${tokens} ${emoji.oblivion})`,
			true
		)
		.field("Oblivion", `**${tokens}** ${emoji.oblivion.repeat(tokens)}`, true)
		.field("Trades Left", `${remainingTrades}`, true)
		.field("Hit List", hitlist)
		.image("https://via.placeholder.com/360x1/2f3136/2f3136")

	if (getMemberColor(member)) embed.color(getMemberColor(member))

	return embed.raw
}

export function getTradeEmbed(
	trade: Exchange,
	finished = false
): WebhookMessageEmbed {
	const { dealerGive, recipientGive, dealer, recipient } = trade

	const dealerPart = dealerGive
		? `**Hit List Items:** ${
				game.getPlayerNamesListFromIds(dealerGive.hitlist) || "*None*"
		  }\n**Oblivion: ${dealerGive.tokens}** ${emoji.oblivion.repeat(
				dealerGive.tokens
		  )}`
		: "*Pending...*"

	const recipientPart = recipientGive
		? `**Hit List Items:** ${
				game.getPlayerNamesListFromIds(recipientGive.hitlist) || "*None*"
		  }\n**Oblivion: ${recipientGive.tokens}** ${emoji.oblivion.repeat(
				recipientGive.tokens
		  )}`
		: "*Pending...*"

	const embed = new RichEmbed()
		.title(`Trade between **${dealer.name} ↔ ${recipient.name}**`)
		.field(`${dealer.name} Gives`, dealerPart, true)
		.field(`${recipient.name} Gives`, recipientPart, true)
		.image("https://via.placeholder.com/360x1/2f3136/2f3136")
		.color(colors.digory)

	if (finished) return embed.raw

	if (trade.isComplete) {
		embed.field(
			`${trade.dealer.name}'s Confirmation Pending!`,
			`**${trade.dealer.name}** must confirm with \`/trade confirm\`. Or either side can \`/trade cancel\``
		)
	} else {
		embed.field(
			`${trade.recipient.name}'s Part Pending`,
			`**${trade.recipient.name}** is missing their part of the trade. They may \`/trade part\``
		)
	}

	return embed.raw
}

export function getGiftEmbed(gift: Exchange): WebhookMessageEmbed {
	return new RichEmbed()
		.title(`Gift **${gift.dealer.name} ➡ ${gift.recipient.name}**`)
		.description(`*${gift.recipient.name} will be given the following items*`)
		.field(
			"Hit List Entries",
			gift
				.dealerGive!.hitlist.map((e) => game.getPlayerNameFromId(e))
				.join("\n") || `_None_`
		)
		.field(
			"Oblivion",
			`**${gift.dealerGive?.tokens}** ${emoji.oblivion.repeat(
				gift.dealerGive?.tokens ?? 0
			)}`
		)
		.image("https://via.placeholder.com/360x1/2f3136/2f3136")
		.thumbnail(gift.recipient.member.avatarURL)
		.color(getMemberColor(gift.dealer.member)).raw
}

export function getMemberColor(member: Eris.Member) {
	const colorRoles = member.roles
		.map((rid) => member.guild.roles.get(rid))
		.filter((r): r is Eris.Role => r !== undefined)
		.filter((r) => r.color)

	if (colorRoles.length < 1) return 0

	const highestColorRole = colorRoles.reduce((a, b) =>
		a.position > b.position ? a : b
	)

	return highestColorRole.color || undefined
}
