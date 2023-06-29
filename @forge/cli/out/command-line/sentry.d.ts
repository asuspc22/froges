import { CachedConfigService } from '../service/cached-config-service';
export declare function initialiseSentry(cachedConfigService: CachedConfigService): Promise<void>;
export declare function setSentryEnvFlags(cliVersion: string, accountId: string, appId: string): Promise<void>;
export declare function setSentryCmdOptFlags(command: string, options: Record<string, unknown>): Promise<void>;
//# sourceMappingURL=sentry.d.ts.map