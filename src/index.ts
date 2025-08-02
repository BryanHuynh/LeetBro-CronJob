import "reflect-metadata";
import { container } from "tsyringe";
import { UserProblems } from "./types/user-submission";
import { LeetCodeAccountRepository } from "./repositories/leetcode-account-repository";
import { getUsersRecentSubmissionsByUsernames } from "./services/leetcode-service";
import dotenv from "dotenv";
import { AcCompletionRepository } from "./repositories/ac-completion-repository";

dotenv.config();
if(!process.env.LEETBRO_HOSTNAME) {
	console.log('UNABLE TO GET SECRETS!')
}
const findNewAcs = async (): Promise<UserProblems | null> => {
	const leetcodeAccountRepo = container.resolve(LeetCodeAccountRepository);
	const leetcode_accounts = await leetcodeAccountRepo.getAllAccounts();
	const leetcode_ids = leetcode_accounts
		.map((account) => account.id)
		.filter((id): id is string => id !== undefined);
	if (leetcode_ids.length == 0) return Promise.resolve(null);
	const leetcode_user_problems = await getUsersRecentSubmissionsByUsernames(leetcode_ids, 5);
	const known_leetcode_user_problems: { [key: string]: String[] } = {};
	const acCompletionRepo = container.resolve(AcCompletionRepository);
	for (const index in leetcode_ids) {
		if (leetcode_ids[index]) {
			const acs = await acCompletionRepo.getAcCompletionsByLeetcodeId(leetcode_ids[index]);
			const acs_ids: String[] = acs.map((ac) => ac.ac_id);
			known_leetcode_user_problems[leetcode_ids[index]] = acs_ids;
		}
	}
	const new_users_acs: UserProblems = {};
	for (const user in leetcode_user_problems) {
		const new_user_acs = leetcode_user_problems[user]?.filter(
			(problem) => !known_leetcode_user_problems[user]?.includes(problem.id)
		);
		if (new_user_acs && new_user_acs.length > 0) {
			new_users_acs[user] = new_user_acs;
		}
	}
	return new_users_acs;
};
console.log('STARTING JOB')
findNewAcs().then(
	(new_users_acs) => {
		if (!new_users_acs || Object.keys(new_users_acs).length == 0) return;
		console.log(new_users_acs);
		fetch(`${process.env.LEETBRO_HOSTNAME}:${process.env.LEETBRO_PORT}/api`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${process.env.BEARER_TOKEN}`
			},
			body: JSON.stringify(new_users_acs),
		}).then((res) => {
			console.log(res);
		});
	},
	(err) => {
		console.log(err);
	}
);
console.log('JOB ENDED')