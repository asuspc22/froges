import { GraphQLClient } from '@forge/cli-shared';
export interface TriggerDeployDetails {
    appId: string;
    environmentKey: string;
    artifactUrl: string;
    hostedResourceUploadId?: string;
}
export interface TriggerDeployClient {
    deploy(details: TriggerDeployDetails): Promise<string>;
}
export declare class NoDeploymentError extends Error {
    constructor();
}
export declare class TriggerDeployGraphQLClient implements TriggerDeployClient {
    private readonly graphqlClient;
    constructor(graphqlClient: GraphQLClient);
    deploy(deploymentDetails: TriggerDeployDetails): Promise<string>;
}
//# sourceMappingURL=trigger-deploy-graphql-client.d.ts.map