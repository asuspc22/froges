import { AppConfigProvider } from '@forge/cli-shared';
export interface ContributorDetails {
    emails?: string[];
    accountIds?: string[];
}
export interface RemoveContributorsDetails extends ContributorDetails {
    appId: string;
}
export interface RemoveContributorsClient {
    removeContributors(details: RemoveContributorsDetails): Promise<void>;
}
export declare class RemoveContributorsCommand {
    private readonly client;
    private readonly getAppConfig;
    constructor(client: RemoveContributorsClient, getAppConfig: AppConfigProvider);
    execute(details: ContributorDetails): Promise<void>;
}
//# sourceMappingURL=remove-contributors.d.ts.map