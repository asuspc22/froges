import { GraphQLClient } from '@forge/cli-shared';
import { AppContributorDetails, AddContributorClient } from './add-contributor';
import { Contributor, ListContributorsClient } from './list-contributors';
import { RemoveContributorsDetails, RemoveContributorsClient } from './remove-contributors';
export declare class MissingAppContributors extends Error {
}
export declare class GraphqlClient implements AddContributorClient, ListContributorsClient, RemoveContributorsClient {
    private readonly graphqlClient;
    constructor(graphqlClient: GraphQLClient);
    addContributor(details: AppContributorDetails): Promise<void>;
    listContributors(appId: string): Promise<Contributor[]>;
    removeContributors(details: RemoveContributorsDetails): Promise<void>;
}
//# sourceMappingURL=graphql-client.d.ts.map