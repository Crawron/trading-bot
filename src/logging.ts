import fetch from "node-fetch"
import * as Eris from "eris"
import { botClient } from "./main"
import { Interaction } from "slasher"

type WebhookEmbedField = {
	name: string
	value: string
	inline?: boolean
}

type WebhookEmbed = Partial<{
	title: string
	description: string
	url: string
	timestamp: number
	color: number
	footer: {
		text: string
		icon_url?: string
	}
	image: {
		url: string
	}
	thumbnail: {
		url: string
	}
	author: {
		name: string
		url?: string
		icon_url?: string
	}
	fields: WebhookEmbedField[]
}>

export type WebhookMessage = Partial<{
	content: string
	username: string
	avatar_url: string
	tts: boolean
	embeds: WebhookEmbed[]
}>

function getInteractionFields(int: Interaction): WebhookEmbedField[] {
	const options =
		int.options[0]?.type.toString() === "SUB_COMMAND"
			? int.options[0].options ?? []
			: int.options

	const subCommand: string =
		int.options[0]?.type.toString() === "SUB_COMMAND"
			? int.options[0].value?.toString() ?? ""
			: ""

	const fields: WebhookEmbedField[] = []

	fields.push({
		name: "Command Name",
		value: `${int.name} ${subCommand ? `(\`${subCommand}\`)` : ""}`,
	})

	if (int.guild)
		fields.push({
			name: "Guild",
			value: `${int.guild.name} \`${int.guild.id}\``,
			inline: true,
		})

	if (int.channel)
		fields.push({
			name: "Channel",
			value: `${int.channel} \`${int.channel.id}\``,
			inline: true,
		})

	fields.push({
		name: "User",
		value: `${int.member} \`${int.member.id}\``,
	})

	if (options.length > 0)
		fields.push({
			name: "Options",
			value: options
				.map(
					(o) =>
						`**${o.name}**: \`${o.value ?? "*none*"}\` *(${o.type.toString()})*`
				)
				.join("\n"),
		})

	return fields
}

function getUserWebhookMessage(
	user: Eris.User,
	theRestOfTheEmbed: WebhookEmbed
): WebhookMessage {
	return {
		username: user.username,
		avatar_url: user.avatarURL,
		embeds: [
			{
				author: {
					name: user.username + "#" + user.discriminator,
					icon_url: user.avatarURL,
				},
				...theRestOfTheEmbed,
			},
		],
	}
}

export const logError = (int?: Interaction) => async (e: Error) => {
	console.log(e.toString())
	const message = getUserWebhookMessage(botClient.user!, {
		title: e.toString(),
		description: `\`\`\`\n${e.stack ?? e}\`\`\``,
		color: 0xff6b81,
		footer: {
			text: "Error",
			icon_url: "https://via.placeholder.com/20x20/ff6b81/ff6b81",
		},
		fields: int ? getInteractionFields(int) : [],
	})

	fetch("https://canary.discord.com/api" + process.env.LOGWEBHOOK!, {
		method: "POST",
		body: JSON.stringify(message),
		headers: { "content-type": "application/json" },
	})
}

export function logInfo(description: string, color: LogColor = LogColor.Blue) {
	console.log(description)
	const message = getUserWebhookMessage(botClient.user!, { description, color })

	fetch("https://canary.discord.com/api" + process.env.LOGWEBHOOK!, {
		method: "POST",
		body: JSON.stringify(message),
		headers: { "content-type": "application/json" },
	})
}

export enum LogColor {
	Red = 0xed4245,
	Blue = 0x3498db,
	Green = 0x3ba55c,
	Yellow = 0xfaa61a,
}
