import Eris = require("eris")
import { WebhookMessageEmbed } from "./slasher/ApiTypes"
import { getPlayerIncommingGifts } from "./commands/gift/common"
import { Exchange } from "./Exchange"
import { game } from "./Game"
import { listIndex } from "./helpers"
import { Player } from "./Player"
import { colors, emoji } from "./strings"

export class RichEmbed {
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

	const hitlist =
		(player.dead
			? "🩸 _You're wounded! Your Hit List has been emptied. You can still recieve Hit List Targets from other players._"
			: "") +
		(listIndex(player.hitList.map(game.getPlayerNameFromId)) || `_Empty_`)

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
		? `**Hit List Targets:** ${
				game.getPlayerNamesListFromIds(dealerGive.hitlist) || "*None*"
		  }\n**Oblivion: ${dealerGive.tokens}** ${emoji.oblivion.repeat(
				dealerGive.tokens
		  )}`
		: "*Pending...*"

	const recipientPart = recipientGive
		? `**Hit List Targets:** ${
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

export function getGiftEmbed(
	gift: Exchange,
	showRecipient = false
): WebhookMessageEmbed {
	const embed = new RichEmbed()
		.title(`Gift **${gift.dealer.name} ➡ ${gift.recipient.name}**`)
		.description(`*This lovely gift contains the following*`)
		.field(
			"Hit List Entries",
			gift
				.dealerGive!.hitlist.map((e) => game.getPlayerNameFromId(e))
				.join("\n") || `_None_`,
			true
		)
		.field(
			"Oblivion",
			`**${gift.dealerGive?.tokens}** ${emoji.oblivion.repeat(
				gift.dealerGive?.tokens ?? 0
			)}`,
			true
		)
		.image("https://via.placeholder.com/360x1/2f3136/2f3136")

	if (showRecipient) {
		embed.thumbnail(gift.recipient.member.avatarURL)
		embed.color(getMemberColor(gift.dealer.member))
	} else {
		embed.thumbnail(gift.dealer.member.avatarURL)
		embed.color(getMemberColor(gift.dealer.member))
	}

	return embed.raw
}

export function pendingExchangesEmbed(player: Player) {
	const exchanges = game.getAllExchangesInvolving(player)

	let trades = exchanges.filter((e) => !e.isGift)
	let gifts = exchanges.filter((e) => e.isGift)
	let pending = exchanges.some((e) => e.hasGivenPart(player))

	const exchToString = (e: Exchange, i: number) => {
		return `${e.isGift ? `\`${i + 1}\`` : "-"} ${e.dealer.name} ${
			e.isGift ? "➡" : "↔"
		} ${e.recipient.name} ${e.hasGivenPart(player) ? ":warning:" : ""}`
	}

	const embed = new RichEmbed()
		.author(`${player.name}'s Pending Exchanges`, player.member.avatarURL)
		.color(getMemberColor(player.member))
		.field("Trades", trades.map(exchToString).join("\n") || "_None_", true)
		.field("Gifts", gifts.map(exchToString).join("\n") || "_None_", true)
		.image("https://via.placeholder.com/360x1/2f3136/2f3136")

	if (pending)
		embed.description(
			":warning: *You have given a part in an exchange, it must be resolved before you can give in any other.*"
		)

	return embed.raw
}

export function getIncomingGiftsEmbed(player: Player) {
	const gifts = getPlayerIncommingGifts(player)
	const embed = new RichEmbed()
		.color(getMemberColor(player.member))
		.author(`Incoming Gifts`, player.member.avatarURL)
		.image("https://via.placeholder.com/360x1/2f3136/2f3136")
		.description(
			gifts
				.map((g, i) => `\`${i + 1}\` From **${g.dealer.name}**`)
				.join("\n") || "_None_"
		)

	if (gifts.length > 0)
		embed.footer("You can't gift while you have incoming gifts")

	return embed.raw
}

export function getMemberColor(member: Eris.Member) {
	const colorRoles = member.roles
		.map((rid) => member.guild.roles.get(rid))
		.filter((r): r is Eris.Role => r !== undefined)
		.filter((r) => r.color)

	if (colorRoles.length < 1) return undefined

	const highestColorRole = colorRoles.reduce((a, b) =>
		a.position > b.position ? a : b
	)

	return highestColorRole.color
}
