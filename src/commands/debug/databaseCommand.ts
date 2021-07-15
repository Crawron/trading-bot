import { Command, stringOpt } from "../../slasher"
import { getDbConnection } from "../../database"

export const databaseCommand = new Command("database", "Debug command", {
	options: [stringOpt("table", "Name of the table", true)],
	action: async (int) => {
		int.defer()

		const table = await int.option<string>("table")
		const db = await getDbConnection()
		const data = db.getTable(table).data

		int.editReply(`\`\`\`json\n${JSON.stringify(data, undefined, 2)}\`\`\``)
	},
})
