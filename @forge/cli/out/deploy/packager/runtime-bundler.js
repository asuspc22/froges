"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeBundler = void 0;
const fs_1 = require("fs");
const bundler_1 = require("@forge/bundler");
const cli_shared_1 = require("@forge/cli-shared");
const packager_1 = require("./packager");
class RuntimeBundler {
    constructor(archiverFactory, logger, bundler) {
        this.archiverFactory = archiverFactory;
        this.logger = logger;
        this.bundler = bundler;
    }
    async bundle(handlers) {
        const archiver = this.archiverFactory();
        archiver.onWarning((err) => {
            this.logger.warn(cli_shared_1.Text.deploy.taskPackage.archiverWarning(err));
        });
        const entryPoints = (0, bundler_1.getEntryPoints)(handlers);
        const moduleList = [];
        if (entryPoints.length > 0) {
            let bundlerResponse;
            try {
                bundlerResponse = await this.bundler(this.logger, process.cwd(), entryPoints);
            }
            catch (e) {
                throw new packager_1.BundlerError(e.message);
            }
            const { output, sourceMap, metadata } = bundlerResponse;
            if (metadata) {
                moduleList.push(...metadata.modules);
            }
            this.logger.debug(cli_shared_1.Text.deploy.taskPackage.packageBundledFiles);
            for (const name in output) {
                archiver.addFile(`${name}.js`, Buffer.from(output[name]));
            }
            if (sourceMap) {
                for (const name in sourceMap) {
                    archiver.addFile(`${name}.js.map`, Buffer.from(sourceMap[name]));
                }
            }
        }
        for (const fileName of cli_shared_1.dependencyFileNames) {
            if ((0, fs_1.existsSync)(fileName)) {
                archiver.addFileFrom(fileName, fileName);
            }
        }
        const archivePath = await archiver.finalise();
        this.logger.debug(cli_shared_1.Text.deploy.taskPackage.archiveCreated(archivePath));
        return { runtimeArchivePath: archivePath, moduleList };
    }
}
exports.RuntimeBundler = RuntimeBundler;
