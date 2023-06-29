import { CachedConfigService } from '../../service/cached-config-service';
import { SettingsView } from '../view/settings-view';
import { AppConfigProvider, FeatureFlagService } from '@forge/cli-shared';
export declare const DEFAULT_ENVIRONMENT_SETTING = "default-environment";
export declare class SettingsController {
    private readonly settingsView;
    private readonly cachedConfigService;
    private readonly getAppConfig;
    private readonly featureFlagService;
    constructor(settingsView: SettingsView, cachedConfigService: CachedConfigService, getAppConfig: AppConfigProvider, featureFlagService: FeatureFlagService);
    private SETTINGS_MAP;
    private getAppId;
    private validateAppManifest;
    private parseBoolean;
    private isAllowedSetting;
    private getSetting;
    getPublicSettings(): Promise<string[]>;
    showSettings(json?: boolean): Promise<void>;
    setSetting(preference: string, value: string): Promise<void>;
}
//# sourceMappingURL=settings-controller.d.ts.map