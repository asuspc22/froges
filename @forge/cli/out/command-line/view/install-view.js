"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstallView = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const egress_1 = require("@forge/egress");
const lodash_1 = require("lodash");
class InstallView {
    constructor(ui) {
        this.ui = ui;
    }
    async promptForPermissionsConfirmation({ scopes, egressAddresses }, addedScopes, manifestScopes, manifestEgressAddresses, environment, confirmScopes, nonInteractive, text) {
        if (addedScopes.length)
            this.ui.info(text.listScopes(addedScopes));
        if (egressAddresses.length)
            this.ui.info(text.listEgressAddresses(egressAddresses));
        const groupedManifestEgressAddresses = (0, egress_1.sortAndGroupEgressPermissionsByDomain)(manifestEgressAddresses);
        let permissionsMismatchWithManifest = false;
        if ((0, cli_shared_1.environmentToOption)(environment) === cli_shared_1.DEFAULT_ENVIRONMENT_OPTION) {
            const scopesMismatch = !(0, lodash_1.isEqual)([...manifestScopes].sort(), [...scopes].sort());
            const egressAddressesMismatch = !(0, lodash_1.isEqual)([...groupedManifestEgressAddresses].sort(), [...egressAddresses].sort());
            permissionsMismatchWithManifest = scopesMismatch || egressAddressesMismatch;
            if (permissionsMismatchWithManifest) {
                this.ui.warn(text.permissionsMismatch(environment));
            }
        }
        if (!confirmScopes && !nonInteractive) {
            const scopesConfirmationResult = await this.ui.confirm(text.promptForPermissionsConfirmation(permissionsMismatchWithManifest));
            if (scopesConfirmationResult)
                this.ui.emptyLine();
            return scopesConfirmationResult;
        }
        return true;
    }
    async promptForUpgrade(installations) {
        const installationIndex = await this.ui.promptForSingleChoiceTable(cli_shared_1.Text.upgradeContext.promptInstallation, cli_shared_1.Text.upgradeContext.overview, ['Environment', 'Site', 'Product', 'Version'], installations.map(({ id, environmentKey, product, site, version }) => ({
            names: [
                (0, cli_shared_1.environmentToOption)(environmentKey),
                site,
                (0, cli_shared_1.capitalizeProduct)(product),
                cli_shared_1.Text.install.booleanToScope(version.isLatest)
            ],
            value: id,
            primary: site
        })));
        const installation = installations[installationIndex];
        return installation;
    }
}
exports.InstallView = InstallView;
