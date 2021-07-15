## Doing

- Actual trading logic
  - Start trade

## Do later

- Start game logic
- Command permissions
- Upload functions

## Done :)

- Model the data
- Database stuff
- Register players
- Make interacting with the db safer?

## Caution

- Dead players are supposed to lose all entries on their Hit List, but for the sake of internal integrity i'll keep them stored, i'll just pretend the entries don't exist for dead people. (Done!)

## Important Goals

- Trade command for players to initiate and resolve (confirm or reject) a trade, and prevents more than 2 trades to happen per dealer.
- Gift command to initiate and resolve a gift between players. Prevent more than 1 gift to each player, per player.
- Keep track of and update players' state after trades and gifts.
- Pet command.
- Roll dice.

## Not as important Goals

- Keep track of overall events and broadcast these logs for spectators. Trades, gifts, eliminations, channel creations, host notes.
- Use a google sheets doc as database to make correcting data easy in case the bot fucks up™.
- Sync with a spreadsheet.
- On the above note, have a way to override data overall, as a command.

## Trading / Gifting

- Every player can do at most 2 trades with another player for the entire game.
- Multiple items can be traded at once in a single trade by either side.
- Dead can trade/gift with the living, and vice versa
- "I dont want players to be able to send gifts if they have any given to them that they haven't accepted or declined"

## Models

Game

- Players
- Active Exchanges
- Overal Variables (current round, etc.)
- Pair Chats

Player

- ID
- Name
- Dead
- VPs
- Remaining Trades
- Tokens
- Hit List

Trade (includes gifts)

- ID (for gifts, dealer..reciever concat. for trades, pair chat id.)
- isGift
- Dealer (Player ids)
- Recipient (Player ids)
- Giving (Hit List and tokens)
- Receiving (Hit List and tokens)
- Round
