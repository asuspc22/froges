"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveContributorsCommand = void 0;
class RemoveContributorsCommand {
    constructor(client, getAppConfig) {
        this.client = client;
        this.getAppConfig = getAppConfig;
    }
    async execute(details) {
        const { id: appId } = await this.getAppConfig();
        await this.client.removeContributors(Object.assign(Object.assign({}, details), { appId }));
    }
}
exports.RemoveContributorsCommand = RemoveContributorsCommand;
