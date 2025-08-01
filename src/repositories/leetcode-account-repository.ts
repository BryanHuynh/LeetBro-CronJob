import { injectable } from "tsyringe";
import "reflect-metadata";
import { LeetcodeAccount } from "../models/leetcode-account";
import { DatabaseService } from "./database-service";

@injectable()
export class LeetCodeAccountRepository {
	constructor(private dbService: DatabaseService) {}

	async getAllAccounts(): Promise<LeetcodeAccount[]> {
		try {
			const res = await this.dbService.execute("select id, created_at from leetcode_account");
			if (res.rows.length > 0) return res.rows;
		} catch (err) {}

		return Promise.resolve([]);
	}
}
