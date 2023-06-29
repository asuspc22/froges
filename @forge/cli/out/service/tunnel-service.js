"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerTunnelService = exports.LocalTunnelService = exports.InProcessTunnelService = exports.DebugNotSupportedError = exports.HiddenDockerTunnelError = exports.IMAGE_NAME = exports.CONTAINER_NAME = void 0;
const tslib_1 = require("tslib");
const cross_spawn_1 = require("cross-spawn");
const os_1 = tslib_1.__importDefault(require("os"));
const path_1 = require("path");
const portfinder_1 = require("portfinder");
const semver_1 = require("semver");
const cli_shared_1 = require("@forge/cli-shared");
const version_info_1 = require("../command-line/version-info");
const DISABLE_TTY = process.env.DISABLE_TTY === 'true';
exports.CONTAINER_NAME = 'forge-tunnel-docker';
const cliDetails = (0, version_info_1.getCLIDetails)();
let versionTags;
if ((cliDetails === null || cliDetails === void 0 ? void 0 : cliDetails.version) !== undefined) {
    if (process.env.FORGE_IN_LOCAL_E2E === 'true') {
        versionTags = ['e2e'];
    }
    else {
        versionTags = (0, semver_1.prerelease)(cliDetails.version) || ['latest'];
    }
}
else {
    versionTags = ['latest'];
}
exports.IMAGE_NAME = process.env.FORGE_DEV_DOCKER_TUNNEL
    ? 'local/forge-tunnel:test'
    : `atlassian/forge-tunnel:${versionTags[0]}`;
class HiddenDockerTunnelError extends cli_shared_1.HiddenError {
    constructor(userError, message) {
        super(message);
        this.userError = userError;
    }
    isUserError() {
        return this.userError;
    }
}
exports.HiddenDockerTunnelError = HiddenDockerTunnelError;
class DebugNotSupportedError extends cli_shared_1.UserError {
    constructor() {
        super(cli_shared_1.Text.tunnel.inspectorUnsupported);
    }
}
exports.DebugNotSupportedError = DebugNotSupportedError;
class InProcessTunnelService {
    constructor(ui, startTunnelCommand, tunnelInteractor, configFilePortFindingService, analyticsService) {
        this.ui = ui;
        this.startTunnelCommand = startTunnelCommand;
        this.tunnelInteractor = tunnelInteractor;
        this.configFilePortFindingService = configFilePortFindingService;
        this.analyticsService = analyticsService;
    }
    async run(tunnelOptions, creds, debugEnabled, onError) {
        try {
            if (tunnelOptions.debug === true) {
                throw new DebugNotSupportedError();
            }
            const resourcePortMap = await this.configFilePortFindingService.findPorts();
            const tunnel = await this.startTunnelCommand.execute({
                environmentKey: tunnelOptions.environment || process.env.ENVIRONMENT_KEY || 'default',
                resourcePortMap,
                host: 'localhost'
            });
            const monitor = await this.tunnelInteractor.watchApp(tunnel);
            await this.tunnelInteractor.handleUserExitEvent(tunnel.stopFunction, monitor);
        }
        catch (e) {
            this.analyticsService.reportTunnelFailure(creds, e.constructor.name, (0, cli_shared_1.isErrorWithAnalytics)(e) ? e.getAttributes() : {});
            if (onError) {
                await onError(e);
            }
            else {
                await (0, cli_shared_1.exitOnError)(this.ui, e);
            }
        }
    }
}
exports.InProcessTunnelService = InProcessTunnelService;
class TunnelServiceBase {
    constructor(configFilePortFindingService) {
        this.configFilePortFindingService = configFilePortFindingService;
    }
    async getDockerOptions(tunnelOptions, debugEnabled, { email, token }) {
        try {
            const graphqlGateway = (0, cli_shared_1.getGraphqlGateway)();
            return [
                '--rm',
                `--name`,
                exports.CONTAINER_NAME,
                '--platform',
                'linux/amd64',
                `--env`,
                `APP_FOLDER=/app`,
                `--env`,
                `FORGE_EMAIL=${email}`,
                `--env`,
                `FORGE_API_TOKEN=${token}`,
                `--env`,
                `ENVIRONMENT_KEY=${tunnelOptions.environment || 'default'}`,
                `--env`,
                `TUNNEL_INSPECTOR_ENABLED=${!!tunnelOptions.debug}`,
                `--env`,
                `FORGE_GRAPHQL_GATEWAY=${graphqlGateway}`,
                `--env`,
                `VERBOSE_MODE=${debugEnabled}`,
                `--env`,
                `CLI_DETAILS=${JSON.stringify(cliDetails)}`,
                `${exports.IMAGE_NAME}`
            ];
        }
        catch (e) {
            throw new HiddenDockerTunnelError(false, "Couldn't populate docker options for tunneling");
        }
    }
    getPortOptions(port, resourcePorts, cspReporterPort) {
        const resourcePortOptions = (0, cli_shared_1.flatMap)(Object.values(resourcePorts), (resourcePort) => [
            '-p',
            `${resourcePort}:${resourcePort}`
        ]);
        const cspReporterPortOption = cspReporterPort
            ? ['-p', `${cspReporterPort}:${cspReporterPort}`, '--env', `CSP_REPORTER_PORT=${cspReporterPort}`]
            : [];
        const addHostOption = os_1.default.platform() === 'linux' ? ['--add-host', 'host.docker.internal:host-gateway'] : [];
        return [
            `-p`,
            `${port}:${port}`,
            ...resourcePortOptions,
            ...addHostOption,
            ...cspReporterPortOption,
            `--env`,
            `TUNNEL_INSPECTOR_PORT=${port}`
        ];
    }
    getResourcePortEnvVarOption(resourcePorts) {
        return ['--env', `RESOURCE_PORT_MAP=${JSON.stringify(resourcePorts)}`];
    }
    getUserEnvironmentVariablesOptions() {
        const options = [];
        Object.keys(process.env)
            .filter((variable) => variable.startsWith('FORGE_USER_VAR_'))
            .forEach((name) => {
            options.push('--env', `${name}=${process.env[name]}`);
        });
        return options;
    }
    addEnvVarsForLocalTunnel(env) {
        return Object.assign(Object.assign({}, env), { PATH: process.env.PATH || '', FORCE_COLOR: '1' });
    }
    transformDockerOptionsToEnvVars(options) {
        const envVarRegex = new RegExp('^(\\w+)=(.+)$', 'g');
        const envVars = options.filter((opt) => envVarRegex.test(opt));
        const envVarObj = {};
        envVars.forEach((envVar) => {
            envVarRegex.lastIndex = 0;
            const [, key, val] = envVarRegex.exec(envVar);
            envVarObj[key] = val;
        });
        return envVarObj;
    }
    getInteractiveOptions() {
        if (DISABLE_TTY) {
            return [`-i`];
        }
        return [`-it`];
    }
    getVolumeOptions() {
        const options = [`-v=${process.cwd()}:/app:cached`];
        if (process.env.FORGE_DEV_DOCKER_TUNNEL) {
            const monorepoRoot = (0, path_1.join)(__dirname, '../../../..');
            options.push(`-v=${monorepoRoot}:/monorepo:cached`);
            options.push(`-v=${monorepoRoot}/node_modules/ngrok/docker-bin:/monorepo/node_modules/ngrok/bin`);
        }
        if (process.env.FORGE_TUNNEL_MOUNT_DIRECTORIES) {
            const mounts = process.env.FORGE_TUNNEL_MOUNT_DIRECTORIES.split(',');
            mounts.forEach((mount) => {
                options.push(`-v=${mount}:cached`);
            });
        }
        return options;
    }
}
class LocalTunnelService extends TunnelServiceBase {
    async run(tunnelOptions, creds, debugEnabled, onError) {
        const dockerOptions = await this.getDockerOptions(tunnelOptions, debugEnabled, creds);
        const port = await (0, portfinder_1.getPortPromise)();
        const resourcePorts = await this.configFilePortFindingService.findPorts();
        const cspReporterPort = await this.configFilePortFindingService.findPortAfter(Object.values(resourcePorts));
        const portOptions = this.getPortOptions(port, resourcePorts, cspReporterPort);
        const envVariablesOptions = this.getUserEnvironmentVariablesOptions();
        const resourcePortEnvVarOption = this.getResourcePortEnvVarOption(resourcePorts);
        const env = this.addEnvVarsForLocalTunnel(this.transformDockerOptionsToEnvVars([
            ...dockerOptions,
            ...portOptions,
            ...envVariablesOptions,
            ...resourcePortEnvVarOption
        ]));
        const process = (0, cross_spawn_1.spawn)('forge-tunnel', [], {
            stdio: 'inherit',
            env: Object.assign(Object.assign({}, env), { FORGE_DEV_TUNNEL: 'true' })
        });
        if (onError) {
            process.on('error', onError);
        }
    }
}
exports.LocalTunnelService = LocalTunnelService;
class DockerTunnelService extends TunnelServiceBase {
    constructor(configFilePortFindingService, dockerService, analyticsService) {
        super(configFilePortFindingService);
        this.dockerService = dockerService;
        this.analyticsService = analyticsService;
    }
    async run(tunnelOptions, creds, debugEnabled) {
        var _a;
        await this.validateDockerVersion(creds, debugEnabled);
        const dockerOptions = await this.getDockerOptions(tunnelOptions, debugEnabled, creds);
        const port = await (0, portfinder_1.getPortPromise)();
        const resourcePorts = await this.configFilePortFindingService.findPorts(port);
        const cspReporterPort = await this.configFilePortFindingService.findPortAfter(Object.values(resourcePorts));
        const portOptions = this.getPortOptions(port, resourcePorts, cspReporterPort);
        const interactiveOptions = this.getInteractiveOptions();
        const volumeOptions = this.getVolumeOptions();
        const envVariablesOptions = this.getUserEnvironmentVariablesOptions();
        const resourcePortEnvVarOption = this.getResourcePortEnvVarOption(resourcePorts);
        const docker = this.dockerService.runContainer([
            ...interactiveOptions,
            ...volumeOptions,
            ...portOptions,
            ...envVariablesOptions,
            ...resourcePortEnvVarOption,
            ...dockerOptions
        ]);
        docker.on('exit', () => this.analyticsService.reportTunnelClosed(creds));
        (_a = docker.stderr) === null || _a === void 0 ? void 0 : _a.on('data', (error) => {
            var _a;
            const errorMessage = error;
            let errorJson;
            try {
                errorJson = JSON.parse(errorMessage);
            }
            catch (e) {
            }
            if (errorJson && errorJson.__tunnel_error__) {
                const tunnelErrorDetails = errorJson;
                this.analyticsService.reportTunnelFailure(creds, tunnelErrorDetails.name, tunnelErrorDetails.attributes);
            }
            else {
                (_a = process.stderr) === null || _a === void 0 ? void 0 : _a.write(errorMessage);
            }
        });
        this.dockerService.startCleanupWorker([docker.pid], exports.CONTAINER_NAME);
    }
    async bootstrapDocker() {
        await this.dockerService.removeContainer(exports.CONTAINER_NAME);
        return this.dockerService.downloadImage(exports.IMAGE_NAME);
    }
    async validateDockerVersion(creds, debugEnabled) {
        const { major, minor, full } = await this.dockerService.getDockerVersion(debugEnabled);
        this.analyticsService.reportDockerVersion(creds, full);
        if (major < 17 || (major === 17 && minor < 3)) {
            throw new HiddenDockerTunnelError(true);
        }
    }
}
exports.DockerTunnelService = DockerTunnelService;
