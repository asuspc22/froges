"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphqlClient = exports.MissingAppContributors = void 0;
const cli_shared_1 = require("@forge/cli-shared");
class MissingAppContributors extends Error {
}
exports.MissingAppContributors = MissingAppContributors;
class GraphqlClient {
    constructor(graphqlClient) {
        this.graphqlClient = graphqlClient;
    }
    async addContributor(details) {
        const mutation = `
      mutation forge_cli_addContributor($input: AddAppContributorInput!) {
        ecosystem {
          addAppContributor(input: $input) {
            success
            errors {
              message
              extensions {
                errorType
                statusCode
              }
            }
          }
        }
      }
    `;
        const { response: { ecosystem: { addAppContributor } }, requestId } = await this.graphqlClient.mutate(mutation, {
            input: {
                appId: details.appId,
                newContributorEmail: details.email,
                role: cli_shared_1.AppContributorRole.Admin
            }
        });
        if (!addAppContributor) {
            throw new cli_shared_1.GraphQlMutationError(`Unable to get a response (requestId: ${requestId || 'unknown'})`, { requestId });
        }
        const { success, errors } = addAppContributor;
        const error = (0, cli_shared_1.getError)(errors);
        if (!success) {
            throw new cli_shared_1.GraphQlMutationError(`${error.message} (requestId: ${requestId || 'unknown'})`, {
                requestId,
                code: error.code,
                statusCode: error.statusCode
            });
        }
    }
    async listContributors(appId) {
        const query = `
      query forge_cli_listContributors($id: ID!) {
        appContributors(id: $id) {
          accountId
          email
          status
          isOwner
          publicName
        }
      }
    `;
        const { appContributors } = await this.graphqlClient.query(query, {
            id: appId
        });
        if (!appContributors) {
            throw new MissingAppContributors(cli_shared_1.Text.listContributors.missingAppContributors);
        }
        return appContributors.map((contributor) => ({
            accountId: contributor.accountId,
            email: contributor.email,
            isOwner: contributor.isOwner,
            publicName: contributor.publicName,
            accountStatus: contributor.status
        }));
    }
    async removeContributors(details) {
        const mutation = `
      mutation forge_cli_removeContributors($input: RemoveAppContributorsInput!) {
        ecosystem {
          removeAppContributors(input: $input) {
            success
            errors {
              message
              extensions {
                errorType
                statusCode
              }
            }
          }
        }
      }
    `;
        const { response: { ecosystem: { removeAppContributors } }, requestId } = await this.graphqlClient.mutate(mutation, {
            input: {
                appId: details.appId,
                emails: details.emails,
                accountIds: details.accountIds
            }
        });
        if (!removeAppContributors) {
            throw new cli_shared_1.GraphQlMutationError(`Unable to get a response (requestId: ${requestId || 'unknown'})`, { requestId });
        }
        const { success, errors } = removeAppContributors;
        const error = (0, cli_shared_1.getError)(errors);
        if (!success) {
            throw new cli_shared_1.GraphQlMutationError(`${error.message} (requestId: ${requestId || 'unknown'})`, {
                requestId,
                code: error.code,
                statusCode: error.statusCode
            });
        }
    }
}
exports.GraphqlClient = GraphqlClient;
