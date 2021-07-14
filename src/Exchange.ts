import { arrayDiff } from "./helpers"
import { Player } from "./Player"

export type RawExchange = {
	/** Is gift */
	isGift: boolean
	/** Player ID */
	dealer: string
	/** Player ID */
	recipient: string
	/** The dealer side is pending */
	dealerDone: boolean
	/** The recipient side is pending */
	recipientDone: boolean
	/** Hit List items the dealer will give, comma separated */
	dealerHitlist?: string
	/** Hit List items the recipient will give, comma separated */
	recipientHitlist?: string
	/** Oblivion the dealer will give */
	dealerTokens?: number
	/** Oblivion the recipient will give */
	recipientTokens?: number
	/** Round */
	round: number
}

export type ExchangeSide = {
	hitlist: string[]
	tokens: number
}

export class Exchange {
	dealerGive?: ExchangeSide
	recipientGive?: ExchangeSide

	constructor(
		public id: string,
		public dealer: Player,
		public recipient: Player,
		public isGift: boolean,
		public round: number
	) {}

	static fromRaw(
		raw: RawExchange,
		dealer: Player,
		recipient: Player,
		id: string
	) {
		const exch = new Exchange(id, dealer, recipient, raw.isGift, raw.round)
		if (raw.dealerDone)
			exch.dealerGives({
				hitlist: raw.dealerHitlist?.split(",") ?? [],
				tokens: raw.dealerTokens ?? 0,
			})

		if (raw.recipientDone)
			exch.recipientGives({
				hitlist: raw.recipientHitlist?.split(",") ?? [],
				tokens: raw.recipientTokens ?? 0,
			})

		return exch
	}

	/** return true on success, string with reason on fail  */
	dealerGives(side: ExchangeSide) {
		const check = this.dealer.canGive(side, !this.isGift)
		if (check !== true) return check // fail reason

		this.dealerGive = side

		return this
	}

	/** return true on success, string with reason on fail */
	recipientGives(side: ExchangeSide) {
		const check = this.recipient.canGive(side, !this.isGift)
		if (check !== true) return check // fail reason

		this.recipientGive = side

		return this
	}

	get isCompletelyEmpty(): boolean {
		return (
			this.dealerGive?.hitlist.length === 0 &&
			this.dealerGive?.tokens === 0 &&
			this.recipientGive?.hitlist.length === 0 &&
			this.recipientGive?.tokens === 0
		)
	}

	get isComplete(): boolean {
		return !!(this.dealerGive && this.recipientGive)
	}

	get tradeResult(): {
		dealer: {
			hitlist: string[]
			tokens: number
		}
		recipient: {
			hitlist: string[]
			tokens: number
		}
	} {
		const { dealer, dealerGive, recipient, recipientGive } = this

		return {
			dealer: {
				hitlist: arrayDiff(
					dealer.hitList, //
					dealerGive?.hitlist ?? []
				).concat(recipientGive?.hitlist ?? []),
				tokens:
					dealer.tokens -
					(dealerGive?.tokens ?? 0) +
					(recipientGive?.tokens ?? 0),
			},
			recipient: {
				hitlist: arrayDiff(
					recipient.hitList,
					recipientGive?.hitlist ?? []
				).concat(dealerGive?.hitlist ?? []),
				tokens:
					recipient.tokens -
					(recipientGive?.tokens ?? 0) +
					(dealerGive?.tokens ?? 0),
			},
		}
	}

	get raw(): RawExchange {
		return {
			isGift: this.isGift,
			dealer: this.dealer.id,
			recipient: this.recipient.id,
			dealerDone: !!this.dealerGive,
			recipientDone: !!this.recipientGive,
			dealerHitlist: this.dealerGive?.hitlist.join(","),
			recipientHitlist: this.recipientGive?.hitlist.join(","),
			dealerTokens: this.dealerGive?.tokens,
			recipientTokens: this.recipientGive?.tokens,
			round: this.round,
		}
	}

	// static fromRaw(raw: RawExchange):Exchange {
	// 	return
	// }
}
