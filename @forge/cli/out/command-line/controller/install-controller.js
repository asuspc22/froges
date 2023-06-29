"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstallController = exports.NoDeploymentError = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const manifest_1 = require("@forge/manifest");
class NoDeploymentError extends Error {
    constructor(environment) {
        super(cli_shared_1.Text.install.error.noDeploymentFound(environment));
    }
}
exports.NoDeploymentError = NoDeploymentError;
class InstallController {
    constructor(appConfigProvider, configFile, ui, installAppSiteCommand, installationService, installView, featureFlags) {
        this.appConfigProvider = appConfigProvider;
        this.configFile = configFile;
        this.ui = ui;
        this.installAppSiteCommand = installAppSiteCommand;
        this.installationService = installationService;
        this.installView = installView;
        this.featureFlags = featureFlags;
    }
    async securityPrompt(site) {
        this.ui.info(cli_shared_1.Text.install.security.banner(site.host));
        let isTrustedApp = true;
        for (const question of cli_shared_1.Text.install.security.questions) {
            if (await this.ui.confirm(question)) {
                isTrustedApp = false;
            }
        }
        if (!isTrustedApp) {
            this.ui.info(cli_shared_1.Text.install.security.notTrustedApp.warn(site.host));
            if (!(await this.ui.confirm(cli_shared_1.Text.install.security.notTrustedApp.confirmApproval))) {
                this.ui.info(cli_shared_1.Text.install.security.notTrustedApp.corpSecurityHelpdesk);
                return;
            }
        }
    }
    async installOrUpgrade(upgrade, environment, environmentType, site, product, appId, text) {
        return this.ui.displayProgress(async () => {
            if (upgrade) {
                const isAlreadyUpdated = await this.installationService.upgradeInstallation(site, product, environment, appId);
                return isAlreadyUpdated;
            }
            else {
                await this.installAppSiteCommand.execute({
                    environmentKey: environment,
                    site,
                    product
                });
                return false;
            }
        }, text.cmd.start(environment, environmentType), (alreadyUpdated) => {
            if (alreadyUpdated) {
                return cli_shared_1.Text.upgrade.alreadyUpdated.spinner;
            }
            else {
                return text.cmd.end(false);
            }
        });
    }
    async promptForProduct() {
        this.ui.info(cli_shared_1.Text.installationContext.overviewProduct);
        return await this.ui.promptForList(cli_shared_1.Text.installationContext.promptProduct, cli_shared_1.SUPPORTED_PRODUCTS);
    }
    async promptForSite(product) {
        this.ui.info(cli_shared_1.Text.installationContext.overviewSite);
        const promptText = product && (0, cli_shared_1.isWorkspaceProduct)(product)
            ? cli_shared_1.Text.installationContext.promptWorkspace
            : cli_shared_1.Text.installationContext.promptSite;
        const trySite = await this.ui.promptForText(promptText);
        if (!trySite) {
            throw new cli_shared_1.ValidationError(cli_shared_1.Text.error.invalidSite);
        }
        return (0, cli_shared_1.validateSite)(trySite, product);
    }
    async promptForUpgrade(siteOption, productOption, environmentOption) {
        const { installations } = await this.installationService.listNonTechnicalAppInstallations({
            site: siteOption === null || siteOption === void 0 ? void 0 : siteOption.host,
            product: productOption,
            environment: environmentOption
        });
        const { site, product, environmentKey, environmentType } = await this.installView.promptForUpgrade(installations);
        return {
            site: (0, cli_shared_1.validateSite)(site, product),
            product: (0, cli_shared_1.capitalizeProduct)(product),
            environment: environmentKey,
            environmentType
        };
    }
    getUniqueInstallationProductsFromScopes(scopes) {
        if (!scopes || scopes.length === 0)
            return undefined;
        const products = new Set();
        scopes.forEach((scope) => {
            if (scope.search('jira') !== -1) {
                products.add('jira');
            }
            else if (scope.search('confluence') !== -1) {
                products.add('confluence');
            }
        });
        return products.size > 0 ? Array.from(products) : undefined;
    }
    async run({ environment, site, product, upgrade, confirmScopes, nonInteractive }) {
        var _a;
        const { id } = await this.appConfigProvider();
        const text = upgrade ? cli_shared_1.Text.upgrade : cli_shared_1.Text.install;
        if (upgrade && (!site || !product)) {
            const upgradeResult = await this.promptForUpgrade(site, product, environment);
            environment = upgradeResult.environment;
            site = upgradeResult.site;
            product = upgradeResult.product;
        }
        product = product ? product : await this.promptForProduct();
        site = site ? site : await this.promptForSite(product);
        this.ui.info(text.banner);
        if ((0, cli_shared_1.isSecureSite)(site)) {
            await this.securityPrompt(site);
        }
        const hasDefaultReadMeScope = await this.featureFlags.readMeScopeAddedByXLS();
        this.ui.debug(`appId ${id} has read:me scope added by default?: ${hasDefaultReadMeScope}`);
        const environmentPermissions = await this.installationService.getAppEnvironmentPermissions(id, environment);
        if (!environmentPermissions || !this.hasDeployments(hasDefaultReadMeScope, environmentPermissions)) {
            this.ui.error(new NoDeploymentError(environment), { pad: false });
            return;
        }
        if (environmentPermissions.scopes === undefined) {
            environmentPermissions.scopes = [];
        }
        const { scopes: environmentScopes, environmentType } = environmentPermissions;
        const [{ permissions }, manifestEgressEntries] = await Promise.all([
            this.configFile.readConfig(),
            this.configFile.getEgressPermissions()
        ]);
        const manifestEgressAddresses = (0, cli_shared_1.flatMap)(manifestEgressEntries, ({ domains }) => domains !== null && domains !== void 0 ? domains : []);
        const manifestScopes = new Set((_a = permissions === null || permissions === void 0 ? void 0 : permissions.scopes) !== null && _a !== void 0 ? _a : []);
        if (hasDefaultReadMeScope) {
            manifestScopes.add('read:me');
        }
        const addedScopes = await this.extractAddedScopes(environmentPermissions);
        const scopesConfirmationResult = await this.installView.promptForPermissionsConfirmation(environmentPermissions, addedScopes, [...manifestScopes], manifestEgressAddresses, environment, confirmScopes, !!nonInteractive, text);
        if (!scopesConfirmationResult)
            return;
        const isAlreadyUpdated = await this.installOrUpgrade(upgrade, environment, environmentType, site, product, id, text);
        if (isAlreadyUpdated) {
            this.ui.info(cli_shared_1.Text.upgrade.alreadyUpdated.banner(environment, product, site.host));
        }
        else {
            this.ui.emptyLine();
            this.ui.info(text.success.banner(environment, environmentType, product, site.host));
            const uniqueProductsFromScopes = this.getUniqueInstallationProductsFromScopes(environmentScopes);
            if (!uniqueProductsFromScopes || uniqueProductsFromScopes.length <= 1)
                return;
            const { installations } = await this.installationService.listNonTechnicalAppInstallations({
                site: site.host,
                environment
            });
            const productsToUpgrade = installations
                .filter((installation) => !installation.version.isLatest)
                .map((installation) => installation.product);
            const installedProducts = installations.map((installation) => installation.product);
            const productsToInstall = uniqueProductsFromScopes.filter((product) => !installedProducts.includes(product));
            if (productsToInstall.length === 0 && productsToUpgrade.length === 0)
                return;
            this.ui.warn(cli_shared_1.Text.install.multiProductScopesDetected(productsToInstall, productsToUpgrade, site.host, environment));
        }
    }
    hasDeployments(hasDefaultReadMeScope, environmentPermissions) {
        var _a;
        return hasDefaultReadMeScope
            ? ((_a = environmentPermissions.scopes) === null || _a === void 0 ? void 0 : _a.length) > 0
            : environmentPermissions.hasDeployments;
    }
    async extractAddedScopes({ addedScopes }) {
        const isAutoConsentAllowed = await this.featureFlags.isAutoConsentAllowed();
        const scopesWithInteractiveConsent = (0, manifest_1.getScopesWithInteractiveConsent)();
        return addedScopes.map((scope) => ({
            name: scope,
            requiresInteractiveConsent: isAutoConsentAllowed ? scopesWithInteractiveConsent.has(scope) : undefined
        }));
    }
}
exports.InstallController = InstallController;
