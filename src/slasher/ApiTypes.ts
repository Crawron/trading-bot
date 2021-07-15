import * as Eris from "eris"

/* Command */

export type ApplicationCommand = {
	name: string
	description: string
	options?: CommandOption[]
	default_permission?: boolean
}

export type CommandOption = {
	type: CommandOptionType
	name: string
	description: string
	required?: boolean
	choices?: { name: string; value: string | number }[]
	options?: CommandOption[]
}

export enum CommandOptionType {
	SUB_COMMAND = 1,
	SUB_COMMAND_GROUP,
	STRING,
	INTEGER,
	BOOLEAN,
	USER,
	CHANNEL,
	ROLE,
	MENTIONABLE,
}

/* Interaction */

export type GuildCommandInteractionData = {
	id: string
	application_id: string
	type: 2
	data: {
		id: string
		name: string
		resolved?: {
			users?: Map<string, UserData>
			members?: Map<string, Omit<GuildMemberData, "user" | "deaf" | "mute">>
			roles?: Map<string, RoleData>
			channels?: Map<string, PartialChannelData>
		}
		options?: CommandInteractionOption[]
	}
	guild_id: string
	channel_id: string
	member: GuildMemberData
	token: string
	version: number
}

export type CommandInteractionOption = {
	name: string
	type: CommandOptionType
	value?: string | number
	options?: CommandInteractionOption[]
}

export enum IntCallbackType {
	Message = 4,
	Defer,
}

export type InteractionCallback = {
	type: IntCallbackType
	data?: {
		tts?: boolean
		content?: string
		embeds?: WebhookMessageEmbed[]
		allowed_mentions?: {
			parse: ("roles" | "users" | "everyone")[]
			roles: string[]
			users: string[]
			replied_user: boolean
		}
		flags?: 64
		components?: object[]
	}
}

enum ComponentType {
	ActionRow = 1, // A container for other components
	Button, // A button object
	SelectMenu, // A select menu for picking from choices
}

type MessageComponent = {
	type: ComponentType
}

export type MessageComponentActionRow = MessageComponent & {
	components: MessageComponent[]
}

export type MessageComponentButton = MessageComponent & {
	style?: number
	label?: string
	emoji?: {
		name: string
		id: string
		animated?: boolean
	}
	custom_id?: string
	url?: string
	disabled?: boolean
}

export type MessageComponentSelectMenu = MessageComponent & {
	options: {
		label: string
		value: string
		description?: string
		emoji?: string
		default?: boolean
	}[]
	placeholder?: string
	min_values?: number
	max_values?: number
}

// Basic API Types

export type WebhookMessageEmbed = {
	title?: string
	type: "rich"
	description?: string
	url?: string
	timestamp?: string
	color?: number
	footer?: { text: string; icon_url?: string }
	image?: { url?: string; height?: string; width?: string }
	thumbnail?: { url?: string; height?: string; width?: string }
	author?: { name: string; url?: string; icon_url?: string }
	fields?: EmbedField[]
	components?: MessageComponent[]
}

export type EmbedField = {
	name: string
	value: string
	inline?: boolean
}

type RoleData = {
	id: string
	name: string
	color: number
	hoist: boolean
	position: number
	permissions: string
	managed: boolean
	mentionable: boolean
	tags?: {
		bot_id?: string
		integration_id?: string
	}
}

type PartialChannelData = {
	id: string
	name: string
	type: number
	permissions: number
}

type GuildMemberData = {
	user: UserData
	nick?: string
	roles: string[]
	joined_at: string
	premium_since?: string
	deaf: boolean
	mute: boolean
	pending?: boolean
	permissions?: string
}

type UserData = {
	id: string
	username: string
	discriminator: string
	avatar: string
	bot?: boolean
	system?: boolean
	mfa_enabled?: boolean
	locale?: string
	verified?: boolean
	email?: string
	flags?: number
	premium_type?: number
	public_flags?: number
}
