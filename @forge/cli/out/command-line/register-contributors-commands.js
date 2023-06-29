"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const tslib_1 = require("tslib");
const cli_shared_1 = require("@forge/cli-shared");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const COMMAND_NAME = 'contributors';
const registerAddContributorCommand = (parent, { ui, commands: { addContributorCommand } }) => {
    parent
        .command('add')
        .requireAppId()
        .description(cli_shared_1.Text.addContributor.cmd.desc)
        .option('-u, --email [email]', cli_shared_1.Text.addContributor.optionContributorEmail)
        .option('--confirm-add-contributor', cli_shared_1.Text.addContributor.optionSkipConfirmation)
        .nonInteractiveOption('--email')
        .action(async ({ email, confirmAddContributor, nonInteractive }) => {
        ui.info(cli_shared_1.Text.addContributor.overview);
        ui.info(cli_shared_1.Text.ctrlC);
        ui.emptyLine();
        if (!email) {
            ui.info(cli_shared_1.Text.addContributor.contributorEmailInfo);
            ui.emptyLine();
            email = await ui.promptForText(cli_shared_1.Text.addContributor.promptContributorEmail);
            ui.emptyLine();
        }
        if (nonInteractive) {
            confirmAddContributor = true;
        }
        if (!confirmAddContributor) {
            ui.info(cli_shared_1.Text.addContributor.confirmationInfo);
            ui.emptyLine();
            ui.info(cli_shared_1.Text.addContributor.learnMore);
            ui.emptyLine();
            confirmAddContributor = await ui.confirm(cli_shared_1.Text.addContributor.promptConfirmation);
            if (confirmAddContributor)
                ui.emptyLine();
        }
        const args = { email };
        if (confirmAddContributor) {
            await ui.displayProgress(() => addContributorCommand.execute(args), cli_shared_1.Text.addContributor.cmd.start, cli_shared_1.Text.addContributor.cmd.success);
        }
    });
};
const registerListContributorsCommand = (parent, { ui, commands: { listContributorCommand } }) => {
    parent
        .command('list')
        .requireAppId()
        .description(cli_shared_1.Text.listContributors.cmd.desc)
        .action(async () => {
        const contributors = await listContributorCommand.execute();
        ui.table([
            ['name', 'Name'],
            ['email', 'Email']
        ], contributors.map((contributor) => {
            var _a;
            const name = [contributor.publicName];
            if (contributor.isOwner) {
                name.push(cli_shared_1.Text.listContributors.appOwner);
            }
            if (contributor.accountStatus !== 'active') {
                name.push(cli_shared_1.Text.listContributors.userInactive);
            }
            return {
                name: name.join(' '),
                email: (_a = contributor.email) !== null && _a !== void 0 ? _a : 'Email Not Visible'
            };
        }), {
            emptyMessage: cli_shared_1.Text.listContributors.noContributors,
            preMessage: cli_shared_1.Text.listContributors.banner
        });
    });
};
const registerRemoveContributorsCommand = (parent, { ui, commands: { listContributorCommand, removeContributorsCommand } }) => {
    parent
        .command('remove')
        .requireAppId()
        .description(cli_shared_1.Text.removeContributors.cmd.desc)
        .option('-u, --email [emails...]', cli_shared_1.Text.removeContributors.optionContributorEmail)
        .option('--confirm-remove-contributors', cli_shared_1.Text.removeContributors.optionSkipConfirmation)
        .nonInteractiveOption('--email')
        .action(async ({ email, confirmRemoveContributors, nonInteractive }) => {
        let accountIds;
        let accountReferences = email;
        if (!email) {
            const contributors = await listContributorCommand.execute();
            const nonOwners = contributors.filter((contributor) => !contributor.isOwner);
            if (nonOwners.length === 0) {
                ui.info(cli_shared_1.Text.removeContributors.addContributorMessage);
                ui.emptyLine();
                return;
            }
            const selectedContributorsIndexes = await ui.promptForTable(cli_shared_1.Text.removeContributors.promptContributorEmail, cli_shared_1.Text.removeContributors.overview, ['Name', 'Email'], nonOwners.map((contributor) => {
                var _a;
                const name = [contributor.publicName];
                if (contributor.accountStatus !== 'active') {
                    name.push(cli_shared_1.Text.listContributors.userInactive);
                }
                return {
                    names: [name.join(' '), (_a = contributor.email) !== null && _a !== void 0 ? _a : 'Email Not Visible'],
                    value: contributor.accountId
                };
            }));
            accountIds = selectedContributorsIndexes.map((index) => nonOwners[index].accountId);
            accountReferences = selectedContributorsIndexes.map((index) => nonOwners[index].publicName);
        }
        if (!accountReferences) {
            return;
        }
        if (nonInteractive) {
            confirmRemoveContributors = true;
        }
        if (!confirmRemoveContributors) {
            ui.info(cli_shared_1.Text.removeContributors.confirmationInfo);
            ui.emptyLine();
            accountReferences.forEach((name) => {
                ui.info(chalk_1.default.grey(name));
            });
            ui.emptyLine();
            confirmRemoveContributors = await ui.confirm(cli_shared_1.Text.removeContributors.promptConfirmation);
            if (confirmRemoveContributors)
                ui.emptyLine();
        }
        if (confirmRemoveContributors) {
            await ui.displayProgress(() => removeContributorsCommand.execute({ emails: email, accountIds }), cli_shared_1.Text.removeContributors.cmd.start, cli_shared_1.Text.removeContributors.cmd.success);
            ui.emptyLine();
            ui.info(cli_shared_1.Text.removeContributors.commandSuccessMessage(accountReferences));
        }
    });
};
const registerCommands = (deps) => {
    const { cmd } = deps;
    const contributors = cmd.command(COMMAND_NAME).description(cli_shared_1.Text.contributors.desc);
    registerAddContributorCommand(contributors, deps);
    registerListContributorsCommand(contributors, deps);
    registerRemoveContributorsCommand(contributors, deps);
};
exports.registerCommands = registerCommands;
