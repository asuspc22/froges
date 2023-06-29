"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddContributorCommand = void 0;
class AddContributorCommand {
    constructor(client, getAppConfig) {
        this.client = client;
        this.getAppConfig = getAppConfig;
    }
    async execute(details) {
        const { id: appId } = await this.getAppConfig();
        await this.client.addContributor(Object.assign(Object.assign({}, details), { appId }));
    }
}
exports.AddContributorCommand = AddContributorCommand;
