"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSentryCmdOptFlags = exports.setSentryEnvFlags = exports.initialiseSentry = void 0;
const tslib_1 = require("tslib");
const Sentry = tslib_1.__importStar(require("@sentry/node"));
const url_1 = require("url");
const SENTRY_DSN = 'https://9829489b1be84a728351c238c6107a33@o55978.ingest.sentry.io/4504449550843904';
async function initialiseSentry(cachedConfigService) {
    if (!cachedConfigService.getAnalyticsPreferences()) {
        return;
    }
    Sentry.init({
        dsn: SENTRY_DSN
    });
}
exports.initialiseSentry = initialiseSentry;
async function setSentryEnvFlags(cliVersion, accountId, appId) {
    Sentry.setTag('cliVersion', cliVersion);
    Sentry.setTag('accountId', accountId);
    Sentry.setTag('appId', appId);
}
exports.setSentryEnvFlags = setSentryEnvFlags;
async function setSentryCmdOptFlags(command, options) {
    Sentry.setTag('command.name', command);
    for (const [name, value] of Object.entries(options)) {
        const formatVal = value instanceof url_1.URL ? value.href : value;
        Sentry.setTag(`flag.${name}`, typeof formatVal === 'string' ? formatVal : JSON.stringify(formatVal));
    }
}
exports.setSentryCmdOptFlags = setSentryCmdOptFlags;
