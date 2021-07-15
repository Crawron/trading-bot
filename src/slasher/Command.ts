import {
	ApplicationCommand,
	CommandOptionType,
	CommandOption,
} from "./ApiTypes"

import { CommandOptionParser } from "./CommandOption"
import { Interaction } from "./Interaction"
import { logError } from "./logging"

type CommandPerms = {
	roles?: string[]
	users?: string[]
}

export abstract class CommandBase {
	constructor(
		public name: string,
		public description: string,
		public permissions?: CommandPerms
	) {
		if (!/^[\w-]{1,32}$/.test(name))
			throw new Error(`Invalid command name: \`${name}\``)
	}

	abstract get optionsRegisterBody(): CommandOption[] | undefined

	get registerBody(): ApplicationCommand {
		return {
			name: this.name,
			description: this.description,
			options: this.optionsRegisterBody,
		}
	}

	get permissionsArray(): { id: string; type: 1 | 2; permission: boolean }[] {
		if (!this.permissions) return []

		return [
			...(this.permissions.roles?.map((p) => ({
				id: p,
				type: 1 as const,
				permission: true,
			})) ?? []),
			...(this.permissions.users?.map((p) => ({
				id: p,
				type: 2 as const,
				permission: false,
			})) ?? []),
		]
	}

	abstract handleInteraction(int: Interaction): Promise<void>
}

export class Command extends CommandBase {
	options: CommandOptionParser[] = []
	action: (int: Interaction) => Promise<unknown>

	constructor(
		name: string,
		description: string,
		params: {
			options?: CommandOptionParser[]
			permissions?: CommandPerms
			action: (int: Interaction) => Promise<unknown>
		}
	) {
		super(name, description, params.permissions)
		this.action = params.action.bind(this)
		this.options = params.options ?? []
	}

	get optionsRegisterBody() {
		return this.options.map((o) => {
			const { parser, ...options } = o
			return options
		})
	}

	async handleInteraction(int: Interaction) {
		this.action(int).catch(logError(int.client, int))
	}
}

export class CommandGroup extends CommandBase {
	subCommands = new Map<string, Command>()

	constructor(
		name: string,
		permissions?: CommandPerms,
		...subCommands: Command[]
	) {
		super(name, name, permissions)
		for (const command of subCommands) {
			this.subCommands.set(command.name, command)
		}
	}

	get optionsRegisterBody() {
		return [...this.subCommands.values()].map((c) => ({
			type: CommandOptionType.SUB_COMMAND,
			name: c.name,
			description: c.description,
			options: c.optionsRegisterBody,
		}))
	}

	async handleInteraction(int: Interaction) {
		if (!int.subCommand) return
		await this.subCommands.get(int.subCommand.name)?.handleInteraction(int)
	}
}
