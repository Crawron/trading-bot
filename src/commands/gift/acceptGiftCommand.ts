import { Command } from "slasher"

export const acceptGiftCommand = new Command(
	"accept",
	"Accepts an incomming gift",
	{ action: async (int) => {} }
)
