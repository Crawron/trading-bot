import { Command } from "../slasher"

export const petCommand = new Command("pet", "Good boy", {
	action: async (int) => {
		const barks = ["Bark", "Woof", "Bork", "Arf", "Wof", "Worf", "Wof"]
		const hearts = [
			":sparkling_heart:",
			":two_hearts:",
			":heart:",
			":heartpulse:",
			":purple_heart:",
			":orange_heart:",
			":blue_heart:",
			":two_hearts:",
			":green_heart:",
			":yellow_heart:",
		]

		int.reply(`*${random(barks)}!* ${random(hearts)}`)
	},
})

function random<T>(arr: T[]): T {
	const i = Math.floor(Math.random() * arr.length)
	return arr[i]
}
