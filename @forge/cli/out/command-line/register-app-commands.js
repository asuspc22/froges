"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = exports.createCommandHandler = exports.directoryNameFromAppName = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const sanitize_filename_1 = tslib_1.__importDefault(require("sanitize-filename"));
const cli_shared_1 = require("@forge/cli-shared");
var TemplateCategory;
(function (TemplateCategory) {
    TemplateCategory["SHOW_ALL"] = "Show All";
    TemplateCategory["CUSTOM_UI"] = "Custom UI";
    TemplateCategory["BACKEND"] = "Triggers and Validators";
    TemplateCategory["UI_KIT"] = "UI kit";
    TemplateCategory["UI_KIT_2"] = "UI kit 2 (Preview)";
})(TemplateCategory || (TemplateCategory = {}));
function ensureDirectoryDoesntExist(directory) {
    if (fs_1.default.existsSync(directory)) {
        throw new cli_shared_1.ValidationError(cli_shared_1.Text.create.error.directory.exists(directory));
    }
}
function ensureValidNameLength(name) {
    if (name.length <= 0 || name.length > 50) {
        throw new cli_shared_1.ValidationError(cli_shared_1.Text.create.error.name.tooLong());
    }
}
function directoryNameFromAppName(appName) {
    if (appName === undefined) {
        return undefined;
    }
    const normalized = (0, sanitize_filename_1.default)(appName.trim()).trim().replace(/ /g, '-');
    const chars = Array.from(normalized);
    const allDashes = chars.every((char) => char === '-');
    return allDashes ? undefined : normalized;
}
exports.directoryNameFromAppName = directoryNameFromAppName;
async function createCommandHandler(ui, createAppCommand, featureFlagService, name, { template, directory }) {
    if (directory) {
        ensureDirectoryDoesntExist(directory);
        ui.info(cli_shared_1.Text.create.intro(directory));
    }
    else {
        directory = directoryNameFromAppName(name) || template;
        if (directory) {
            ensureDirectoryDoesntExist(directory);
        }
        const currentDirectory = process.cwd();
        ui.info(cli_shared_1.Text.create.introWithCurrentDirectory(currentDirectory));
    }
    ui.info(cli_shared_1.Text.ctrlC);
    if (!name) {
        ui.info(cli_shared_1.Text.create.overviewAppName);
        name = await ui.promptForText(cli_shared_1.Text.create.promptName);
        if (!directory) {
            directory = directoryNameFromAppName(name) || template;
            if (directory) {
                ensureDirectoryDoesntExist(directory);
            }
        }
    }
    ensureValidNameLength(name);
    if (!template) {
        ui.info(cli_shared_1.Text.create.overviewTemplates);
        const templates = await ui.displayTemporaryMessage(() => createAppCommand.getAvailableTemplates(), cli_shared_1.Text.create.waitTemplates);
        const enableCSUIK = await featureFlagService.readFlag('forge-cli-enable-csuik');
        const type = await ui.promptForList(cli_shared_1.Text.create.promptCategory, Object.values(TemplateCategory).filter((category) => enableCSUIK || category !== TemplateCategory.UI_KIT_2));
        const filteredTemplates = type === TemplateCategory.SHOW_ALL
            ? templates
            : templates
                .filter((name) => {
                switch (type) {
                    case TemplateCategory.BACKEND:
                        return (!name.includes('ui-kit') &&
                            !name.includes('csuik') &&
                            !name.includes('custom-ui') &&
                            name !== 'blank');
                    case TemplateCategory.CUSTOM_UI:
                        return name.includes('custom-ui');
                    case TemplateCategory.UI_KIT:
                        return name.includes('ui-kit');
                    case TemplateCategory.UI_KIT_2:
                        return name.includes('csuik');
                }
            })
                .map((name) => name.replace('-ui-kit', '').replace('-custom-ui', '').replace('-csuik', ''));
        template = await ui.promptForList(cli_shared_1.Text.create.promptTemplate, filteredTemplates);
        if (type === TemplateCategory.UI_KIT) {
            template = `${template}-ui-kit`;
        }
        if (type === TemplateCategory.UI_KIT_2) {
            template = `${template}-csuik`;
        }
        if (type === TemplateCategory.CUSTOM_UI) {
            template = `${template}-custom-ui`;
        }
        if (!directory) {
            directory = template;
            ensureDirectoryDoesntExist(directory);
        }
    }
    ui.emptyLine();
    directory = directory;
    const args = { name, template, directory };
    const result = await ui.displayProgress(() => createAppCommand.execute(args), cli_shared_1.Text.create.cmd.start, cli_shared_1.Text.create.cmd.success(name));
    ui.info(cli_shared_1.Text.create.cmd.successDetails(directory, result.environments));
    return result;
}
exports.createCommandHandler = createCommandHandler;
function registerCreateCommands({ cmd, ui, commands: { createAppCommand }, services: { featureFlagService } }) {
    cmd
        .command('create [name]')
        .description(cli_shared_1.Text.create.cmd.desc)
        .option('-t, --template <template name>', cli_shared_1.Text.create.optionTemplate)
        .option('-d, --directory <directory name>', cli_shared_1.Text.create.optionDirectory)
        .action((name, options) => createCommandHandler(ui, createAppCommand, featureFlagService, name, options));
}
function registerRegisterCommand({ cmd, ui, commands: { registerAppCommand } }) {
    cmd
        .command('register [name]')
        .description(cli_shared_1.Text.register.cmd.desc)
        .requireManifestFile()
        .action(async (name) => {
        ui.info(cli_shared_1.Text.register.intro);
        ui.info(cli_shared_1.Text.ctrlC);
        ui.emptyLine();
        if (!name) {
            ui.info(cli_shared_1.Text.create.overviewAppName);
            name = await ui.promptForText(cli_shared_1.Text.create.promptName);
            ui.emptyLine();
        }
        const result = await ui.displayProgress(() => registerAppCommand.execute({ name }), cli_shared_1.Text.register.cmd.start, cli_shared_1.Text.register.cmd.success(name));
        ui.info(cli_shared_1.Text.register.cmd.successDetails(result.environments));
        return result;
    });
}
function registerCommands(deps) {
    registerCreateCommands(deps);
    registerRegisterCommand(deps);
}
exports.registerCommands = registerCommands;
