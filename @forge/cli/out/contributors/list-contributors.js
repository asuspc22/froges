"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListContributorsCommand = void 0;
class ListContributorsCommand {
    constructor(client, getAppConfig) {
        this.client = client;
        this.getAppConfig = getAppConfig;
    }
    async execute() {
        const { id: appId } = await this.getAppConfig();
        return await this.client.listContributors(appId);
    }
}
exports.ListContributorsCommand = ListContributorsCommand;
