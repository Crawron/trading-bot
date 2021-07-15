import Eris = require("eris")
import SheetDatabase from "sheets-database"
import { getDbConnection } from "./database"
import { Exchange, ExchangeSide, RawExchange } from "./Exchange"
import { botClient } from "./main"
import { Player, RawPlayer } from "./Player"

class Game {
	players = new Map<string, Player>()
	vars = new Map<string, string | number | boolean>()

	activeExchanges: Map<string, Exchange> = new Map()

	constructor() {
		this.getPlayer = this.getPlayer.bind(this)
		this.getPlayerNameFromId = this.getPlayerNameFromId.bind(this)
	}

	get inProgress() {
		return (this.vars.get("round") ?? 0) > 0
	}

	isPlayer(id: string) {
		return [...this.players.keys()].includes(id)
	}

	async fetchData() {
		const db = await getDbConnection()

		/* Fetching */
		await this.fetchPlayers(db)
		this.fetchVars(db)
		this.fetchExchanges(db)

		// logInfo("Fetched Game Data")
	}

	async uploadData() {
		this.uploadPlayers()
		this.uploadExchanges()
	}

	async logGameInfo(content: Eris.MessageContent) {
		const channel = (botClient.guilds
			.get(process.env.GUILDID!)
			?.channels.get(process.env.GAMELOGCHANNEL!) ??
			(await botClient.getRESTChannel(
				process.env.GAMELOGCHANNEL!
			))) as Eris.TextChannel

		channel.createMessage(content)
	}

	getPlayerNamesListFromIds(playerIds: string[]): string {
		let names = []
		for (const id of playerIds) names.push(this.getPlayer(id).name)
		return names.join(", ") || "No"
	}

	getPlayerNameFromId(id: string) {
		return this.getPlayer(id).name
	}

	getAllExchangesInvolving(player: Player) {
		return [...this.activeExchanges.values()].filter(
			(e) => e.dealer.id === player.id || e.recipient.id === player.id
		)
	}

	pendingTradeBetween(playerA: Player, playerB: Player) {
		return [...this.activeExchanges.values()]
			.filter((e) => !e.isGift)
			.find(
				(e) =>
					(e.recipient.id === playerB.id && e.dealer.id === playerA.id) ||
					(e.recipient.id === playerA.id && e.dealer.id === playerB.id)
			)
	}

	hasOutstanding(player: Player) {
		return [...this.activeExchanges.values()].some((e) =>
			e.hasGivenPart(player)
		)
	}

	findGiftFor(player: Player, from?: Player) {
		return [...this.activeExchanges.values()].find(
			(e) =>
				e.recipient.id === player.id &&
				e.isGift &&
				(from ? e.dealer.id === from.id : true)
		)
	}

	startTrade(
		dealer: Player,
		recipient: Player,
		dealerSide: ExchangeSide
	): Exchange | string {
		const exchange = new Exchange(
			this.activeExchanges.size.toString(),
			dealer,
			recipient,
			false,
			this.vars.get("round") as number
		)

		/* Set dealer's side. if issue, return reason. */
		const result = exchange.dealerGives(dealerSide)
		if (typeof result === "string") return result

		/* no trade issue, add to exchanges queue */
		this.activeExchanges.set(exchange.id, exchange)

		return exchange
	}

	startGift(
		dealer: Player,
		recipient: Player,
		dealerSide: ExchangeSide
	): true | string {
		/* dealer can't gift if they have pending gifts incoming */
		if (this.findGiftFor(dealer))
			return "You have incoming gifts pending, you must accept or decline them before sending other gifts."

		/* find pending gifts */
		if (this.findGiftFor(recipient, dealer))
			return "There's already a pending gift from you for this person."

		const exchange = new Exchange(
			this.activeExchanges.size.toString(),
			dealer,
			recipient,
			true,
			this.vars.get("round") as number
		)

		const result = exchange.dealerGives(dealerSide)
		if (typeof result === "string") return result

		const recResult = exchange.recipientGives({ hitlist: [], tokens: 0 })
		if (typeof recResult === "string") return recResult

		this.activeExchanges.set(exchange.id, exchange)

		this.uploadExchanges()

		return true
	}

	private async fetchExchanges(db?: SheetDatabase) {
		db ??= await getDbConnection()
		const exchTable = db.getTable("Exchanges").data as RawExchange[]

		this.activeExchanges.clear()
		for (const [i, exch] of exchTable.entries()) {
			const dealer = this.players.get(exch.dealer)
			const recipient = this.players.get(exch.recipient)

			if (!dealer || !recipient)
				throw new Error(
					"Error fetching active exch: Can't find either dealer or recipient"
				)

			this.activeExchanges.set(
				i.toString(),
				Exchange.fromRaw(exch, dealer, recipient, i.toString())
			)
		}
	}

	async uploadExchanges(db?: SheetDatabase) {
		db ??= await getDbConnection()
		const exchTable = db.getTable("Exchanges")

		await exchTable.clear()
		exchTable.insertMany([...this.activeExchanges.values()].map((e) => e.raw))
	}

	private async fetchVars(db?: SheetDatabase) {
		db ??= await getDbConnection()
		const gameTable = db.getTable("GameVars")
		const varsData = gameTable.getDataArray()
		this.vars.clear()

		for (const [k, v] of varsData) {
			if (k == null || v == null) throw new Error("Missing or broken game var")
			this.vars.set(k.toString(), v)
		}
	}

	async uploadVars(db?: SheetDatabase) {
		db ??= await getDbConnection()

		const varsTable = db.getTable("GameVars")
		await varsTable.clear()

		varsTable.insertMany([...this.vars.entries()])
	}

	private async fetchPlayers(db?: SheetDatabase) {
		db ??= await getDbConnection()
		const playersTable = db.getTable("Players").data as RawPlayer[]
		this.players.clear()

		for (const playerRow of playersTable) {
			this.players.set(
				playerRow.id!.toString(),
				await Player.fromRaw(playerRow as RawPlayer)
			)
		}
	}

	async uploadPlayers(db?: SheetDatabase) {
		db ??= await getDbConnection()
		const playersTable = db.getTable("Players")

		await playersTable.clear()
		playersTable.insertMany([...this.players.values()].map((p) => p.raw))

		console.log("Uploaded Player Data")
	}

	getPlayer(id: string) {
		const player = this.players.get(id)
		if (!player) throw new Error("Can't find player " + id)
		return player
	}

	async addPlayerFromMember(member: Eris.Member) {
		const newPlayer = Player.newFromMember(member)
		this.players.set(newPlayer.id, newPlayer)
		await this.uploadPlayers()
		return newPlayer
	}

	async populateHitlists() {
		await this.fetchData()
		const players = [...this.players.values()]

		const N = players.length
		const os1 = this.vars.get("offset1") as number
		const os2 = this.vars.get("offset2") as number
		const os3 = this.vars.get("offset3") as number

		for (const [x, player] of players.entries()) {
			player.clearHitlist()

			const i1 = (x + os1) % N
			const i2 = (x + os2) % N
			const i3 = (x + os3) % N

			player.addHitList(players[i1].id, players[i2].id, players[i3].id)
		}

		this.uploadPlayers()
	}
}

export const game = new Game()
