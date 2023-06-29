import { spawn } from 'cross-spawn';
import { HiddenError, PersonalApiCredentials, PersonalApiCredentialsValidated, UI, UserError } from '@forge/cli-shared';
import { StartTunnelCommand, TunnelInteractor } from '@forge/tunnel';
import { DockerService } from './docker-service';
import { ConfigFilePortFindingService } from './port-finding-service';
import { TunnelAnalyticsService } from './tunnel-analytics-service';
export interface TunnelOptions {
    debug?: boolean;
    environment?: string;
}
export declare const CONTAINER_NAME = "forge-tunnel-docker";
export declare const IMAGE_NAME: string;
export declare class HiddenDockerTunnelError extends HiddenError {
    private readonly userError;
    constructor(userError: boolean, message?: string);
    isUserError(): boolean;
}
export declare type TunnelService = {
    run(tunnelOptions: TunnelOptions, creds: PersonalApiCredentialsValidated, debugEnabled: boolean, onError?: (err: Error) => Promise<void>): Promise<void>;
};
export declare class DebugNotSupportedError extends UserError {
    constructor();
}
export declare class InProcessTunnelService implements TunnelService {
    private readonly ui;
    private readonly startTunnelCommand;
    private readonly tunnelInteractor;
    private readonly configFilePortFindingService;
    private readonly analyticsService;
    constructor(ui: UI, startTunnelCommand: StartTunnelCommand, tunnelInteractor: TunnelInteractor, configFilePortFindingService: ConfigFilePortFindingService, analyticsService: TunnelAnalyticsService);
    run(tunnelOptions: TunnelOptions, creds: PersonalApiCredentialsValidated, debugEnabled: boolean, onError?: (err: Error) => Promise<void>): Promise<void>;
}
declare abstract class TunnelServiceBase implements TunnelService {
    protected readonly configFilePortFindingService: ConfigFilePortFindingService;
    constructor(configFilePortFindingService: ConfigFilePortFindingService);
    abstract run(tunnelOptions: TunnelOptions, creds: PersonalApiCredentialsValidated, debugEnabled: boolean, onError?: (err: Error) => Promise<void>): Promise<void>;
    protected getDockerOptions(tunnelOptions: TunnelOptions, debugEnabled: boolean, { email, token }: PersonalApiCredentials): Promise<string[]>;
    protected getPortOptions(port: number, resourcePorts: Record<string, number>, cspReporterPort: number | undefined): string[];
    protected getResourcePortEnvVarOption(resourcePorts: Record<string, number>): string[];
    protected getUserEnvironmentVariablesOptions(): string[];
    protected addEnvVarsForLocalTunnel(env: {
        [key: string]: string;
    }): Record<string, string>;
    protected transformDockerOptionsToEnvVars(options: string[]): {
        [key: string]: string;
    };
    protected getInteractiveOptions(): string[];
    protected getVolumeOptions(): string[];
}
export declare class LocalTunnelService extends TunnelServiceBase {
    run(tunnelOptions: TunnelOptions, creds: PersonalApiCredentialsValidated, debugEnabled: boolean, onError?: (err: Error) => Promise<void>): Promise<void>;
}
export declare class DockerTunnelService extends TunnelServiceBase {
    private readonly dockerService;
    private readonly analyticsService;
    constructor(configFilePortFindingService: ConfigFilePortFindingService, dockerService: DockerService, analyticsService: TunnelAnalyticsService);
    run(tunnelOptions: TunnelOptions, creds: PersonalApiCredentialsValidated, debugEnabled: boolean): Promise<void>;
    bootstrapDocker(): Promise<ReturnType<typeof spawn>>;
    private validateDockerVersion;
}
export {};
//# sourceMappingURL=tunnel-service.d.ts.map