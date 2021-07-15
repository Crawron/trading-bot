import * as Eris from "eris"

import {
	IntCallbackType,
	InteractionCallback,
	GuildCommandInteractionData,
	WebhookMessageEmbed,
	CommandInteractionOption,
	CommandOptionType,
} from "./ApiTypes"
import { parseByType, ParserReturn } from "./CommandOption"
import { logError } from "./logging"

export class Interaction {
	id: string
	name: string

	replied = false
	deferred = false

	constructor(
		public data: GuildCommandInteractionData,
		public client: Eris.Client,
		public member: Eris.Member,
		public guild: Eris.Guild,
		public channel: Eris.TextChannel
	) {
		this.id = data.id
		this.name = data.data.name
	}

	static async create(data: GuildCommandInteractionData, client: Eris.Client) {
		const guild =
			client.guilds.get(data.guild_id) ??
			(await client.getRESTGuild(data.guild_id))

		const member =
			guild.members.get(data.member.user.id) ??
			(await guild.getRESTMember(data.member.user.id))

		const channel =
			guild.channels.get(data.channel_id) ??
			(await guild.getRESTChannels()).find((c) => c.id === data.channel_id)
		if (!channel) throw new Error(`Channel \`${data.channel_id}\` not found`)

		return new Interaction(
			data,
			client,
			member,
			guild,
			channel as Eris.TextChannel
		)
	}

	private get responseUrl() {
		return `/interactions/${this.data.id}/${this.data.token}/callback`
	}

	get acknowledged() {
		return this.replied || this.deferred
	}

	get options() {
		if (this.subCommand) return this.subCommand.options ?? []
		else return this.data.data.options ?? []
	}

	private _parsedOptions: Map<string, ParserReturn> | undefined

	async parsedOptions() {
		if (!this._parsedOptions) {
			const optionsMap: Map<string, ParserReturn> = new Map()

			for (const option of this.options.filter((o) => o.type > 2))
				optionsMap.set(option.name, await parseByType(option, this))

			this._parsedOptions = optionsMap
		}

		return this._parsedOptions!
	}

	async option<T = unknown>(name: string, fallback?: T): Promise<T> {
		const value = (await this.parsedOptions()).get(name) as T | undefined

		if (value === undefined)
			if (fallback === undefined)
				throw new Error(`Option \`${name}\` not found`)
			else return fallback

		return value
	}

	/** Returns called sub command name, or undefined if none */
	get subCommand():
		| { name: string; options?: CommandInteractionOption[] }
		| undefined {
		const subCommand = this.data.data.options?.find(
			(o) => o.type === CommandOptionType.SUB_COMMAND
		)
		if (subCommand)
			return {
				name: subCommand.name,
				options: subCommand.options!,
			}
	}

	async reply(
		content?: string,
		ephemeral = false,
		...embeds: WebhookMessageEmbed[]
	) {
		this.client.requestHandler
			.request("POST", this.responseUrl, true, {
				type: IntCallbackType.Message,
				data: { content, embeds, flags: ephemeral ? 64 : undefined },
			} as InteractionCallback)
			.then(() => (this.replied = true))
			.catch(logError(this.client, this))
	}

	async defer() {
		await this.client.requestHandler.request("POST", this.responseUrl, true, {
			type: IntCallbackType.Defer,
			data: { conent: "one sec" },
		} as InteractionCallback)
		this.deferred = true
	}

	async editReply(content?: string, ...embeds: WebhookMessageEmbed[]) {
		await this.client.requestHandler.request(
			"PATCH",
			`/webhooks/${this.data.application_id}/${this.data.token}/messages/@original`,
			true,
			{ content, embeds } as InteractionCallback["data"]
		)
	}

	async followUp(
		content?: string,
		ephemeral = false,
		...embeds: WebhookMessageEmbed[]
	) {
		return (await this.client.requestHandler.request(
			"POST",
			`/webhooks/${this.data.application_id}/${this.data.token}`,
			true,
			{
				content,
				embeds,
				flags: ephemeral ? 64 : undefined,
			} as InteractionCallback["data"]
		)) as Eris.BaseData
	}

	async deleteReply() {
		await this.client.requestHandler.request(
			"DELETE",
			`/webhooks/${this.data.application_id}/${this.data.token}/messages/@original`,
			true
		)
	}

	async editFollowup(
		messageId: string,
		content?: string,
		...embeds: WebhookMessageEmbed[]
	) {
		await this.client.requestHandler.request(
			"PATCH",
			`/webhooks/${this.data.application_id}/${this.data.token}/messages/${messageId}`,
			true,
			{ content, embeds } as InteractionCallback["data"]
		)
	}

	async deleteFollowup(messageId: string) {
		await this.client.requestHandler.request(
			"DELETE",
			`/webhooks/${this.data.application_id}/${this.data.token}/messages/${messageId}`,
			true
		)
	}
}
