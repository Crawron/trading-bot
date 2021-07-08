export type RawChannel = {
	type: "pair" | "thoughts"
	channelId: string
	playerA: string
	playerB?: string // undefined if "thoughts"
}

export type WebhookMessage = Partial<{
	content: string
	username: string
	avatar_url: string
	tts: boolean
	embeds: Partial<{
		title: string
		description: string
		url: string
		// timestamp: Date // ?
		color: number
		footer: { text: string; icon_url?: string }
		image: { url: string }
		thumbnail: { url: string }
		author: { name: string; url?: string; icon_url?: string }
		fields: { name: string; value: string; inline?: boolean }[]
	}>[]
}>
