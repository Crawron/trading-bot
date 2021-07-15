import { SheetDatabase } from "sheets-database"

import "dotenv/config"

const db = new SheetDatabase(process.env.SHEETDOCID!)
// const googleCreds = require("../google-auth.json")
let authed = false

export async function getDbConnection() {
	if (!authed) {
		await db.useServiceAccount({
			client_email: process.env.CLIENTEMAIL!,
			private_key: process.env.GOOGLEPRIVATEKEY!,
		})
		authed = true
	}
	await db.sync()
	return db
}

export async function registerTables() {
	const db = await getDbConnection() // shadowed

	const gameTable = await db
		.addTable("TheGame", ["round"])
		.catch(() => db.getTable("TheGame"))

	const playersTable = await db
		.addTable("Players", [
			"id",
			"displayName",
			"dead",
			"vp",
			"tokenCount",
			"remainingTrades",
			"hitList",
		])
		.catch(() => db.getTable("Players"))

	console.log({ playersData: playersTable.data })

	const tradesTable = await db
		.addTable("Trades", [
			"id",
			"dealerName",
			"recipientName",
			"round",
			"giveHitlist",
			"giveTokens",
			"recieveHitlist",
			"recieveTokens",
		])
		.catch(() => db.getTable("Trades"))

	console.log({ tradesData: tradesTable.data })

	const giftsTable = await db
		.addTable("Gifts", [
			"id",
			"dealerName",
			"recipientName",
			"round",
			"giveHitlist",
			"giveTokens",
		])
		.catch(() => db.getTable("Gifts"))

	console.log({ giftsData: giftsTable.data })
}
