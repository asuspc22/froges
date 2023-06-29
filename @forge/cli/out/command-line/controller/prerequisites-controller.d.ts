import { CLIDetails, FeatureFlagReader, Logger } from '@forge/cli-shared';
interface FeatureFlagValues {
    muaoEnabled: boolean;
    concurrentDevEnabled: boolean;
}
export declare type PrerequisitesCheckResult = FeatureFlagValues;
export declare class PrerequisitesController {
    private readonly logger;
    private readonly featureFlags;
    private readonly cliDetails;
    constructor(logger: Logger, featureFlags: FeatureFlagReader, cliDetails: CLIDetails | undefined);
    check(): Promise<PrerequisitesCheckResult>;
    private evaluateFeatureFlags;
    private checkNodeVersion;
    private checkCustomWarning;
    private checkMUAOEnabled;
    private checkConcurrentDevelopmentEnabled;
}
export {};
//# sourceMappingURL=prerequisites-controller.d.ts.map