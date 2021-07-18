import * as Eris from "eris"
import { checkSubset } from "./helpers"
import { botClient } from "./main"
import { ExchangeSide } from "./Exchange"

export type RawPlayer = {
	id: string // Discord user id
	name: string // Displayed name on discord
	dead: boolean
	vp: number // victory points, bad tokens excluded
	remainingTrades: number // remaining trades, starts at 2
	tokenCount: number // substracts vp, 1 x token
	hitList?: string // player playerIds
}

type PlayerParams = {
	member: Eris.Member
	vp: number // victory points, bad tokens considered
	remainingTrades: number // remaining trades, starts at 2
	hitList: string[] // array of player ids
	tokenCount: number // substracts vp, 1 x token
	dead: boolean
}

export class Player {
	id: string
	dead: boolean
	member: Eris.Member
	remainingTrades: number
	tokens: number
	vp: number

	constructor(private def: PlayerParams) {
		this.id = this.def.member.id
		this.dead = this.def.dead
		this.member = this.def.member
		this.remainingTrades = this.def.remainingTrades
		this.tokens = this.def.tokenCount
		this.vp = this.def.vp
	}

	static async fromRaw(raw: RawPlayer) {
		const guild =
			botClient.guilds.get(process.env.GUILDID!) ??
			(await botClient.getRESTGuild(process.env.GUILDID!))
		const member =
			guild.members.get(raw.id) ?? (await guild.getRESTMember(raw.id))

		return new Player({
			...raw,
			hitList: raw.hitList?.split(",") ?? [],
			member,
		})
	}

	static newFromMember(member: Eris.Member): Player {
		return new Player({
			member,
			dead: false,
			hitList: [],
			tokenCount: 1,
			remainingTrades: 2,
			vp: 0,
		})
	}

	get name() {
		return this.def.member.nick ?? this.def.member.username
	}

	get hitList() {
		if (this.dead) return []
		return this.def.hitList.sort()
	}

	set hitList(hitlist: string[]) {
		this.def.hitList = hitlist
	}

	/** Returns whether successful */
	removeHitList(ids: string[]): boolean {
		const check = checkSubset(ids, this.hitList)
		if (!check) return false

		for (const id in ids) {
			const i = this.def.hitList.findIndex((e) => e === id)
			if (i < 0) this.def.hitList.splice(i, 1)
		}

		return true
	}

	addHitList(...ids: string[]) {
		this.def.hitList.push(...ids)
	}

	clearHitlist() {
		this.def.hitList = []
	}

	canGive(trade: ExchangeSide, checkTradeCount = true) {
		if (checkTradeCount && this.def.remainingTrades < 1)
			return `${this.name} has ran out of trades`

		const check = checkSubset(trade.hitlist, this.hitList)
		if (!check)
			return `\`${
				this.name
			}\` is missing HL entries. (Some of: ${trade.hitlist.join(", ")})`

		if (trade.tokens > this.tokens) {
			return `Not enough oblivion from \`${this.name}\`. (${trade.tokens}/${this.tokens})`
		}

		return true
	}

	get raw(): RawPlayer {
		const {
			id,
			name: displayName,
			dead,
			def,
			remainingTrades,
			tokens,
			hitList,
			vp,
		} = this

		return {
			id,
			name: displayName,
			dead,
			tokenCount: tokens,
			vp,
			remainingTrades,
			hitList: hitList.join(","),
		}
	}
}
