import "reflect-metadata";
import { Pool, PoolConfig, QueryResult } from "pg";
import { singleton } from "tsyringe";

@singleton()
export class DatabaseService {
	private pgConfig: PoolConfig;
	private pool: Pool;

	constructor() {
		this.pgConfig = {
			user: process.env.POSTGRES_USER,
			host: process.env.POSTGRES_HOST,
			database: process.env.POSTGRES_DATABASE,
			password: process.env.POSTGRES_PASSWORD,
			port: parseInt(process.env.POSTGRES_PORT || "5432"),
			ssl: true,
		};
		this.pool = new Pool(this.pgConfig);
		this.init();
	}

	init(): void {
		process.on("SIGINT", async () => {
			console.log("Closing database pool...");
			await this.pool.end();
			process.exit();
		});
		this.testConnection().then(console.log)
	}

	async testConnection() {
		try {
			this.pool.query("SELECT 1");
			return true;
		} catch (err) {
			return false;
		}
	}

	async execute(query: string, params?: any[]): Promise<QueryResult<any>> {
		// An async function automatically handles promise resolution and rejection.
		if(!this.pool) {
			this.pool = new Pool(this.pgConfig);
			this.init();
		}
		return await this.pool.query(query, params);
	}
}
