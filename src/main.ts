import { Client } from "eris"
import * as Eris from "eris"

import { CommandHandler } from "slasher"
import { game } from "./Game"
import { LogColor, logError, logInfo } from "./logging"
import { tradeGroup } from "./commands/trade/tradeGroup"
import { debugGroup } from "./commands/debug/debugGroup"
import { hitlistCommand } from "./commands/hitlistCommand"
import { hostGroup } from "./commands/host/hostGroup"

import "dotenv/config"
import { pendingCommand } from "./commands/pendingCommand"
import { rollCommand } from "./commands/rollCommand"

export const botClient = new Client(process.env.TOKEN!, {
	restMode: true,
	intents: ["guilds", "guildMessages", "guildMembers"],
	autoreconnect: false,
})

botClient.on("ready", async () => {
	const command = new CommandHandler(botClient, {
		commands: [
			tradeGroup,
			debugGroup,
			hitlistCommand,
			pendingCommand,
			hostGroup,
			rollCommand,
		],
	})

	await botClient.guilds.get(process.env.GUILDID!)?.fetchAllMembers()

	await game.fetchData().catch(logError())
	botClient.editStatus("online")
	console.log("Ready.")
})

botClient.on("messageCreate", async (msg) => {
	if (!(msg.channel instanceof Eris.TextChannel)) return
	if (msg.content === "!createTables") {
		msg.channel.createMessage("todo lol")
	}

	if (msg.content === "!shutdown" && msg.author.id === process.env.BOTOWNER!) {
		await msg.channel.createMessage("Lmao bye")
		botClient.editStatus("offline")
		await sleep(5000)
		botClient.disconnect({})
		process.exit(0)
	}
})

const sleep = async (ms: number) => new Promise((res) => setTimeout(res, ms))

botClient.on("disconnect", () => {
	logInfo("Disconnected...", LogColor.Red)
	process.exit()
})
botClient.on("error", logError())

botClient.connect()
