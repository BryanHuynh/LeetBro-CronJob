export interface UserSubmission {
	recentAcSubmissionList: Problem[];
}

export interface Problem {
	id: string;
	title: string;
	titleSlug: string;
	timestamp: string;
	submissionUrl?: string;
}

export interface UserProblems {
	[username: string]: Problem[];
}

const submissionUrlTemplate = "https://leetcode.com/submissions/detail/";
export function fromUserSubmissionsResponse(
	response: UserSubmission,
	username: string
): UserProblems {
	const submissions = response.recentAcSubmissionList;
	let problems: UserProblems = {};
	submissions.forEach((submission) => {
		const problem: Problem = {
			id: submission.id,
			title: submission.title,
			titleSlug: submission.titleSlug,
			timestamp: new Date(Number.parseInt(submission.timestamp) * 1000).toString(),
			submissionUrl: `${submissionUrlTemplate}${submission.id}/`,
		};
		problems[username] = problems[username] ? [...problems[username], problem] : [problem];
	});
	return problems;
}

export function fromUsersSubmissionsResponse(response: UserProblems): UserProblems {
	for (let username in response) {
		if (response[username]) {
			response[username].forEach((submission) => {
				submission.submissionUrl = `${submissionUrlTemplate}${submission.id}/`;
			});
		}
	}
	return response;
}
