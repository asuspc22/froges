"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = exports.DEFAULT_ENVIRONMENT_SETTING = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const manifest_1 = require("@forge/manifest");
const environment_1 = require("../environment");
exports.DEFAULT_ENVIRONMENT_SETTING = 'default-environment';
const ALLOWED_SETTINGS = ['usage-analytics', exports.DEFAULT_ENVIRONMENT_SETTING];
class SettingsController {
    constructor(settingsView, cachedConfigService, getAppConfig, featureFlagService) {
        this.settingsView = settingsView;
        this.cachedConfigService = cachedConfigService;
        this.getAppConfig = getAppConfig;
        this.featureFlagService = featureFlagService;
        this.SETTINGS_MAP = {
            'usage-analytics': {
                description: cli_shared_1.Text.settings.usageAnalytics.description,
                get: () => this.cachedConfigService.getAnalyticsPreferences(),
                set: (value) => {
                    const parsedValue = this.parseBoolean(value);
                    this.cachedConfigService.setAnalyticsPreferences(parsedValue);
                },
                isAvailable: () => true
            },
            'default-environment': {
                description: cli_shared_1.Text.settings.defaultEnvironment.description,
                get: async () => {
                    const appId = await this.getAppId();
                    const environment = this.cachedConfigService.getDefaultEnvironment(appId);
                    return environment ? (0, cli_shared_1.environmentToOption)(environment) : environment;
                },
                set: async (value) => {
                    (0, environment_1.validateDevEnvironment)(value);
                    const environment = (0, environment_1.checkEnvironmentOption)(value);
                    const appId = await this.getAppId();
                    this.cachedConfigService.setDefaultEnvironment(appId, environment);
                },
                getDisplayValue: (value) => cli_shared_1.Text.env.displayEnvironment(value, cli_shared_1.AppEnvironmentType.Development),
                isAvailable: async () => (await this.validateAppManifest()).success && (await this.featureFlagService.isConcurrentDevEnabled()),
                additionalInfo: cli_shared_1.Text.settings.defaultEnvironment.info
            }
        };
    }
    async getAppId() {
        const { id } = await this.getAppConfig();
        return id;
    }
    async validateAppManifest() {
        const fileValidator = new manifest_1.FileValidator();
        return fileValidator.validate(manifest_1.MANIFEST_FILE);
    }
    parseBoolean(value) {
        switch (value) {
            case 'true':
                return true;
            case 'false':
                return false;
            default:
                throw new cli_shared_1.ValidationError(cli_shared_1.Text.settings.set.invalidValue);
        }
    }
    isAllowedSetting(preference) {
        return ALLOWED_SETTINGS.includes(preference);
    }
    async getSetting(preference) {
        if (!this.isAllowedSetting(preference)) {
            return null;
        }
        const publicSettings = await this.getPublicSettings();
        if (publicSettings.includes(preference)) {
            return this.SETTINGS_MAP[preference];
        }
        return null;
    }
    async getPublicSettings() {
        const settings = [];
        for (const setting of ALLOWED_SETTINGS) {
            if (await this.SETTINGS_MAP[setting].isAvailable()) {
                settings.push(setting);
            }
        }
        return settings;
    }
    async showSettings(json) {
        const settings = [];
        for (const settingName of ALLOWED_SETTINGS) {
            const setting = await this.getSetting(settingName);
            if (setting !== null) {
                settings.push([settingName, setting.description, await setting.get()]);
            }
        }
        this.settingsView.showSettings(settings, json);
    }
    async setSetting(preference, value) {
        const setting = await this.getSetting(preference);
        if (setting === null) {
            const publicSettings = await this.getPublicSettings();
            throw new cli_shared_1.ValidationError(cli_shared_1.Text.settings.set.invalidSetting(publicSettings));
        }
        if (setting.additionalInfo) {
            this.settingsView.showAdditionalInfo(setting.additionalInfo);
        }
        await setting.set(value);
        const displayValue = setting.getDisplayValue ? setting.getDisplayValue(value) : value;
        this.settingsView.setSuccess(preference, displayValue);
    }
}
exports.SettingsController = SettingsController;
