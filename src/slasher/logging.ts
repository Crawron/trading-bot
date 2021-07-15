import * as Eris from "eris"
import { Interaction } from "./Interaction"

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
	const options = int.subCommand?.options
	const subCommand = int.subCommand?.name

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
			value: `${int.channel.mention} \`${int.channel.id}\``,
			inline: true,
		})

	if (options)
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
					name: `${user.username}#${user.discriminator}`,
					icon_url: user.avatarURL,
				},
				...theRestOfTheEmbed,
			},
		],
	}
}

export function logError(client: Eris.Client, int?: Interaction) {
	return async (e: Error) => {
		console.log(e.toString())
		const message = getUserWebhookMessage(client.user!, {
			title: e.toString(),
			description: `\`\`\`\n${e.stack ?? e}\`\`\``,
			color: 0xff6b81,
			footer: {
				text: "Error",
				icon_url: "https://via.placeholder.com/20x20/ff6b81/ff6b81",
			},
			fields: int ? getInteractionFields(int) : [],
		})

		client.requestHandler.request(
			"POST",
			process.env.LOGWEBHOOK!,
			false,
			message
		)
	}
}

export function logInfo(
	client: Eris.Client,
	description: string,
	color: LogColor = LogColor.Blue
) {
	console.log(description.toString())
	const message = getUserWebhookMessage(client.user!, { description, color })
	client.requestHandler.request("POST", process.env.LOGWEBHOOK!, false, message)
}

enum LogColor {
	Red = 0xed4245,
	Blue = 0x3498db,
	Green = 0x3ba55c,
	Yellow = 0xfaa61a,
}
