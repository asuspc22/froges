import { AppConfigProvider } from '@forge/cli-shared';
export interface ContributorDetails {
    email: string;
}
export interface AppContributorDetails extends ContributorDetails {
    appId: string;
}
export interface AddContributorClient {
    addContributor(details: AppContributorDetails): Promise<void>;
}
export declare class AddContributorCommand {
    private readonly client;
    private readonly getAppConfig;
    constructor(client: AddContributorClient, getAppConfig: AppConfigProvider);
    execute(details: ContributorDetails): Promise<void>;
}
//# sourceMappingURL=add-contributor.d.ts.map