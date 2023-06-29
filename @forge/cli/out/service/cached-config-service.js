"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedConfigService = void 0;
const ANALYTICS_PREFERENCES_KEY = 'analytics-preferences';
const DEFAULT_ENVIRONMENT_KEY = 'default-environment';
class CachedConfigService {
    constructor(cachedConf) {
        this.cachedConf = cachedConf;
    }
    getAnalyticsPreferences() {
        if (process.env.FORGE_DISABLE_ANALYTICS) {
            return false;
        }
        return this.cachedConf.get(ANALYTICS_PREFERENCES_KEY);
    }
    setAnalyticsPreferences(preference) {
        this.cachedConf.set(ANALYTICS_PREFERENCES_KEY, preference);
    }
    getDefaultEnvironments() {
        return this.cachedConf.get(DEFAULT_ENVIRONMENT_KEY) || {};
    }
    getDefaultEnvironment(appId) {
        const defaultEnvironments = this.getDefaultEnvironments();
        return defaultEnvironments[appId];
    }
    setDefaultEnvironment(appId, preference) {
        const defaultEnvironments = this.getDefaultEnvironments();
        defaultEnvironments[appId] = preference;
        this.cachedConf.set(DEFAULT_ENVIRONMENT_KEY, defaultEnvironments);
    }
}
exports.CachedConfigService = CachedConfigService;
