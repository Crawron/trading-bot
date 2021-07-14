import { CommandGroup } from "slasher"
import { startGiftCommand } from "./startGiftCommand"

export const giftGroup = new CommandGroup("gift", undefined, startGiftCommand)
