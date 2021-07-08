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
	dealerPending: boolean
	/** The recipient side is pending */
	recipientPending: boolean
	/** Hitlist items the dealer will give, comma separated */
	dealerHitlist?: string
	/** Hitlist items the recipient will give, comma separated */
	recipientHitlist?: string
	/** Tokens the dealer will give */
	dealerTokens?: number
	/** Tokens the recipient will give */
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
		public dealer: Player,
		public recipient: Player,
		public isGift: boolean,
		public round: number
	) {}

	/** return true on success, string with reason on fail  */
	dealerGives(side: ExchangeSide) {
		const check = this.dealer.canGive(side, !this.isGift)
		if (check !== true) return check // fail reason

		this.dealerGive = side

		return true
	}

	/** return true on success, string with reason on fail */
	recipientGives(side: ExchangeSide) {
		const check = this.recipient.canGive(side, !this.isGift)
		if (check !== true) return check // fail reason

		this.recipientGive = side

		return true
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
				hitlist: dealerGive?.hitlist
					? arrayDiff(dealer.hitList, dealerGive.hitlist).concat(
							recipientGive?.hitlist ?? []
					  )
					: dealer.hitList,
				tokens: dealerGive?.tokens
					? dealer.tokens - dealerGive.tokens + (recipientGive?.tokens ?? 0)
					: dealer.tokens,
			},
			recipient: {
				hitlist: recipientGive?.hitlist
					? arrayDiff(recipient.hitList, recipientGive.hitlist).concat(
							dealerGive?.hitlist ?? []
					  )
					: recipient.hitList,
				tokens: recipientGive?.tokens
					? recipient.tokens - recipientGive.tokens + (dealerGive?.tokens ?? 0)
					: recipient.tokens,
			},
		}
	}

	get raw(): RawExchange {
		return {
			isGift: this.isGift,
			dealer: this.dealer.id,
			recipient: this.recipient.id,
			dealerPending: !!this.dealerGive,
			recipientPending: !!this.recipientGive,
			round: this.round,
		}
	}

	// static fromRaw(raw: RawExchange):Exchange {
	// 	return
	// }
}
