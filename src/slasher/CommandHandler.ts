import * as Eris from "eris"
import { CommandBase } from "./Command"
import { Interaction } from "./Interaction"
import { ApplicationCommand, GuildCommandInteractionData } from "./ApiTypes"
import { logError } from "./logging"

export class CommandHandler {
	commands = new Map<string, CommandBase>()

	constructor(
		public client: Eris.Client,
		options?: { commands: CommandBase[] }
	) {
		for (const command of options?.commands ?? []) {
			this.commands.set(command.name, command)
		}

		client.on(
			"messageCreate",
			async (msg: Eris.Message<Eris.GuildTextableChannel>) => {
				if (msg.author.id !== process.env.BOTOWNER!) return

				if (msg.content.startsWith("!setup")) {
					this.setupCommand(msg as Eris.Message<Eris.TextChannel>)
					return
				}

				if (msg.content.startsWith("!clearAll")) {
					if (!this.client.application) {
						msg.channel.createMessage("Application info not defined")
						return
					}

					const endpoint = `/applications/${this.client.application?.id}/guilds/${msg.channel.guild.id}/commands`

					const commands = (await this.client.requestHandler.request(
						"GET",
						endpoint,
						true
					)) as (ApplicationCommand & { id: string })[]

					for (const command of commands) {
						this.client.requestHandler.request(
							"DELETE",
							`${endpoint}/${command.id}`,
							true
						)
					}

					msg.channel.createMessage("(hopefully) done.")
					return
				}
			}
		)

		client.on("rawWS", async (packet) => {
			if (packet.t !== "INTERACTION_CREATE") return

			const intData = packet.d as GuildCommandInteractionData

			if (intData.type !== 2) return
			if (!intData.guild_id) return

			try {
				const int = await Interaction.create(intData, client)
				this.handleInteraction(int).catch(logError(client, int))
			} catch (e) {
				logError(client)(e)
			}
		})
	}

	private async handleInteraction(int: Interaction) {
		const command = this.commands.get(int.name)
		try {
			await command?.handleInteraction(int)
		} catch (e) {
			logError(this.client, int)(e)
		}
	}

	addCommand(...commands: CommandBase[]) {
		for (const command of commands) this.commands.set(command.name, command)
	}

	private async setupCommand(msg: Eris.Message<Eris.GuildTextableChannel>) {
		const cmdName = msg.content.replace(/^!setup/, "").trim()
		if (cmdName.length === 0) {
			msg.channel.createMessage("Didn't give a command name. `!setup name`")
			return
		}

		const command = this.commands.get(cmdName)
		if (!command) {
			msg.channel.createMessage(`Couldn't find command \`${cmdName}\``)
			return
		}

		await this.registerCommand(command, msg.guildID)
		msg.channel.createMessage("Registered")
	}

	private async registerCommand(command: CommandBase, guildId: string) {
		if (!this.client.application)
			throw new Error("Client application data is not defined")

		const commandRetrun = (await this.client.requestHandler.request(
			"POST",
			`/applications/${this.client.application.id}/guilds/${guildId}/commands`,
			true,
			{ ...command.registerBody, default_permission: !command.permissions }
		)) as ApplicationCommand & { id: string }

		if (command.permissions) {
			this.client.requestHandler.request(
				"PUT",
				`/applications/${this.client.application.id}/guilds/${guildId}/commands/${commandRetrun.id}/permissions`,
				true,
				{
					permissions: [
						...command.permissionsArray,
						{ id: process.env.BOTOWNER!, type: 2, permission: true },
					],
				}
			)
		}
	}
}
