import { GraphQLClient, gql } from "graphql-request";
import { fromUsersSubmissionsResponse, UserProblems } from "../types/user-submission";

const leetCodeEndpoint: string = "https://leetcode.com/graphql/";

export async function getUsersRecentSubmissionsByUsernames(
	usernames: string[],
	limit: number = 10
): Promise<UserProblems> {
	let query: string = gql`
		query recentAcSubmissions(${usernames
			.map((_, index) => `$username${index}: String!`)
			.join(", ")}, $limit: Int!) {
	`;
	for (let i = 0; i < usernames.length; i++) {
		query += `${usernames[i]}: recentAcSubmissionList(username: $username${i}, limit: $limit) {
					id
					title
					titleSlug
					timestamp
				}`;
	}
	query += "}";

	let variables: any = {};
	for (let i = 0; i < usernames.length; i++) {
		variables[`username${i}`] = usernames[i];
	}
	variables["limit"] = limit;
	const graphQLClient = new GraphQLClient(leetCodeEndpoint);
	const response = await graphQLClient.request<UserProblems>(query, variables);
	return fromUsersSubmissionsResponse(response);
}
