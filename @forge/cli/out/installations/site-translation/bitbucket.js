"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitbucketTranslator = exports.getBitbucketEndpoint = exports.InvalidResponseError = exports.InvalidWorkspaceError = void 0;
const tslib_1 = require("tslib");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const url_1 = require("url");
const cs_ari_1 = require("@forge/util/packages/cs-ari");
const cli_shared_1 = require("@forge/cli-shared");
class InvalidWorkspaceError extends Error {
    constructor(url) {
        super(cli_shared_1.Text.install.error.invalidWorkspace(url));
    }
}
exports.InvalidWorkspaceError = InvalidWorkspaceError;
class InvalidResponseError extends Error {
    constructor(url) {
        super(cli_shared_1.Text.install.error.site(url.toString()));
    }
}
exports.InvalidResponseError = InvalidResponseError;
const DEFAULT_BITBUCKET_ENDPOINT = 'https://api.bitbucket.org';
const BITBUCKET_URL = new url_1.URL('https://bitbucket.org');
const RESOURCE_TYPE = 'workspace';
const RESOURCE_OWNER = 'bitbucket';
const getBitbucketEndpoint = () => {
    return process.env.BITBUCKET_ENDPOINT || DEFAULT_BITBUCKET_ENDPOINT;
};
exports.getBitbucketEndpoint = getBitbucketEndpoint;
class BitbucketTranslator {
    ariBelongsToProduct(ari) {
        return ari.resourceOwner === RESOURCE_OWNER;
    }
    async buildInstallationContext(product, site) {
        const workspaceId = await this.getWorkspaceId(site);
        const ari = new cs_ari_1.ResourceIdentifier({
            resourceOwner: product.toLowerCase(),
            resourceType: RESOURCE_TYPE,
            resourceId: workspaceId
        });
        return ari;
    }
    async getSitesForResourceAris(aris) {
        const workspaceIds = aris.map((ari) => ari.resourceId);
        const workspaceAriToHostname = {};
        const workspaceUrls = await Promise.all(workspaceIds.map((workspaceId) => this.getWorkspaceUrl(workspaceId)));
        aris.forEach((ari, index) => {
            const result = workspaceUrls[index];
            workspaceAriToHostname[ari.toString()] = result ? result.toString() : ari.resourceId;
        });
        return workspaceAriToHostname;
    }
    async getWorkspaceId(site) {
        const workspaceName = this.extractWorkspaceName(site);
        const url = this.buildFetchUrl(workspaceName);
        const res = await (0, node_fetch_1.default)(url);
        if (!res.ok) {
            throw new InvalidWorkspaceError(site);
        }
        let json;
        try {
            json = await res.json();
        }
        catch (err) {
            throw new InvalidResponseError(site);
        }
        if (json && json.uuid) {
            return this.extractWorkspaceId(json.uuid);
        }
        throw new InvalidResponseError(site);
    }
    async getWorkspaceUrl(workspaceId) {
        const url = this.buildFetchUrl(this.decorateWorkspaceId(workspaceId));
        const res = await (0, node_fetch_1.default)(url);
        if (!res.ok) {
            return null;
        }
        let json;
        try {
            json = await res.json();
        }
        catch (err) {
            return null;
        }
        if (json && json.slug) {
            return this.buildWorkspaceUrl(json.slug);
        }
        return null;
    }
    decorateWorkspaceId(workspaceId) {
        return `%7B${workspaceId}%7D`;
    }
    extractWorkspaceId(workspaceIdWithBraces) {
        return workspaceIdWithBraces.replace(/\{|\}/gi, '');
    }
    buildFetchUrl(workspaceNameOrId) {
        const urlObj = new url_1.URL(`${(0, exports.getBitbucketEndpoint)()}/2.0/workspaces/${workspaceNameOrId}`);
        return urlObj.toString();
    }
    extractWorkspaceName(workspaceURL) {
        if (workspaceURL.hostname !== BITBUCKET_URL.hostname) {
            throw new InvalidWorkspaceError(workspaceURL);
        }
        const pathnames = workspaceURL.pathname.substr(1).split('/');
        if (!pathnames.length) {
            throw new InvalidWorkspaceError(workspaceURL);
        }
        return pathnames[0];
    }
    buildWorkspaceUrl(workspaceName) {
        return new url_1.URL(`/${workspaceName}/`, BITBUCKET_URL);
    }
}
exports.BitbucketTranslator = BitbucketTranslator;
