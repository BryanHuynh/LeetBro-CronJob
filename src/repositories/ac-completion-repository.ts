import "reflect-metadata";
import { injectable } from "tsyringe";
import { DatabaseService } from "./database-service";
import { AcCompletion } from "../models/ac-completion";

@injectable()
export class AcCompletionRepository {
	constructor(private dbService: DatabaseService) {}

	async getAcCompletionsByLeetcodeId(leetcode_id: string): Promise<AcCompletion[]> {
		const res = await this.dbService.execute(
			"select ac_id, leetcode_id, timestamp, created_at from ac_completion where leetcode_id = $1",
			[leetcode_id]
		);
		if (res.rows.length > 0) return res.rows;
		return Promise.resolve([]);
	}
}
