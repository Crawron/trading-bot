import * as Eris from "eris"
import { Interaction } from "./Interaction"
import {
	CommandOptionType as CommandOptionType,
	CommandInteractionOption,
	CommandOption,
} from "./ApiTypes"

export function stringOpt(
	name: string,
	description: string,
	required = false
): CommandOptionParser {
	return {
		name,
		description,
		required,
		type: CommandOptionType.STRING,
		parser: String,
	}
}

export function stringChoiceOpt(
	name: string,
	description: string,
	required = false,
	...choices: readonly [name: string, value: string][]
): CommandOptionParser {
	if (choices.length < 1) throw new Error("One choice required")
	return {
		name,
		description,
		required,
		choices: choices.map(([name, value]) => ({ name, value })),
		type: CommandOptionType.STRING,
		parser: (val) => val,
	}
}

export function integerOpt(
	name: string,
	description: string,
	required = false
): CommandOptionParser {
	return {
		name,
		description,
		required,
		type: CommandOptionType.INTEGER,
		parser: (v) => parseInt(v),
	}
}

export function integerChoiceOpt(
	name: string,
	description: string,
	required = false,
	...choices: [name: string, value: number][]
): CommandOptionParser {
	if (choices.length < 1) throw new Error("One choice required")
	return {
		name,
		description,
		required,
		choices: choices.map(([name, value]) => ({ name, value })),
		type: CommandOptionType.INTEGER,
		parser: (val) => parseInt(val),
	}
}

export function booleanOpt(
	name: string,
	description: string,
	required = false
): CommandOptionParser {
	return {
		name,
		description,
		required,
		type: CommandOptionType.STRING,
		parser: (v) => v.toLowerCase() === "true",
	}
}

export function userOpt(
	name: string,
	description: string,
	required = false
): CommandOptionParser {
	return {
		name,
		description,
		required,
		type: CommandOptionType.USER,
		parser: async (v, int) => {
			return int.client.users.get(v) ?? (await int.client.getRESTUser(v))
		},
	}
}

const parseMember = async (v: string, int: Interaction) => {
	return int.guild.members.get(v) ?? (await int.guild.getRESTMember(v))
}

export function memberOpt(
	name: string,
	description: string,
	required = false
): CommandOptionParser {
	return {
		name,
		description,
		required,
		type: CommandOptionType.USER,
		parser: parseMember,
	}
}

export function memberOrUserOpt(
	name: string,
	description: string,
	required = false
): CommandOptionParser {
	return {
		name,
		description,
		required,
		type: CommandOptionType.USER,
		parser: parseMemberOrUser,
	}
}

const parseMemberOrUser = async (
	v: string,
	int: Interaction
): Promise<Eris.Member | Eris.User> => {
	return (
		int.guild.members.get(v) ??
		(await int.guild.getRESTMember(v)) ??
		int.client.users.get(v) ??
		(await int.client.getRESTUser(v))
	)
}

export function channelOpt(
	name: string,
	description: string,
	required = false
): CommandOptionParser {
	return {
		name,
		description,
		required,
		type: CommandOptionType.USER,
		parser: parseChannel,
	}
}

const parseChannel = async (
	v: string,
	int: Interaction
): Promise<Eris.AnyGuildChannel> => {
	if (!int.data.guild_id) throw new Error("No Guild ID")

	const guild =
		int.client.guilds.get(int.data.guild_id) ??
		(await int.client.getRESTGuild(int.data.guild_id))

	const channel = guild.channels.get(v)
	if (!channel) throw new Error(`Channel '${v}' not found`)

	return channel
}

export function roleOpt(
	name: string,
	description: string,
	required = false
): CommandOptionParser {
	return {
		name,
		description,
		required,
		type: CommandOptionType.ROLE,
		parser: parseRole,
	}
}

const parseRole = async (v: string, int: Interaction) => {
	if (!int.data.guild_id) throw new Error("No Guild ID")

	const guild =
		int.client.guilds.get(int.data.guild_id) ??
		(await int.client.getRESTGuild(int.data.guild_id))

	const role = guild.roles.get(v)
	if (!role) throw new Error(`Role '${v}' not found`)

	return role
}

export async function parseByType(
	option: CommandInteractionOption,
	int: Interaction
) {
	const parsers: Record<CommandOptionType, OptionParserFunction> = {
		[CommandOptionType.STRING]: String,

		[CommandOptionType.INTEGER]: (v) => parseInt(v),
		[CommandOptionType.BOOLEAN]: (v) => v.toLowerCase() === "true",
		[CommandOptionType.USER]: parseMember,
		[CommandOptionType.CHANNEL]: parseChannel,
		[CommandOptionType.ROLE]: parseRole,

		[CommandOptionType.SUB_COMMAND]: () => undefined,
		[CommandOptionType.SUB_COMMAND_GROUP]: () => undefined,
		[CommandOptionType.MENTIONABLE]: String,
	}

	if (option.value !== undefined)
		return await parsers[option.type](option.value.toString(), int)
}

export type OptionParserFunction = (
	value: string,
	int: Interaction
) => ParserReturn | Promise<ParserReturn>

export type CommandOptionParser = CommandOption & {
	parser: OptionParserFunction
}

export type ParserReturn =
	| string
	| number
	| boolean
	| Eris.User
	| Eris.Member
	| Eris.Channel
	| Eris.Role
	| undefined
