import { AppConfigProvider } from '@forge/cli-shared';
export interface Contributor {
    accountId: string;
    email?: string | null;
    accountStatus: string;
    publicName: string;
    isOwner?: boolean | null;
}
export interface ListContributorsClient {
    listContributors(appId: string): Promise<Contributor[]>;
}
export declare class ListContributorsCommand {
    private readonly client;
    private readonly getAppConfig;
    constructor(client: ListContributorsClient, getAppConfig: AppConfigProvider);
    execute(): Promise<Contributor[]>;
}
//# sourceMappingURL=list-contributors.d.ts.map