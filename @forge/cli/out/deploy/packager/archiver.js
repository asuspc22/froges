"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipArchiver = void 0;
const tslib_1 = require("tslib");
const archiver_1 = tslib_1.__importDefault(require("archiver"));
const fs_1 = require("fs");
const path_1 = require("path");
const tmp_1 = tslib_1.__importDefault(require("tmp"));
const cli_shared_1 = require("@forge/cli-shared");
class ZipArchiver {
    constructor(logger) {
        this.logger = logger;
        this.archive = (0, archiver_1.default)('zip');
        this.tempFile = tmp_1.default.fileSync({ postfix: '.zip' });
        this.resolves = [];
        this.rejects = [];
        this.inspectDirectory = null;
        this.onArchiveError = (err) => {
            for (const reject of this.rejects) {
                reject(err);
            }
        };
        this.onClose = () => {
            for (const resolve of this.resolves) {
                resolve(this.tempFile.name);
            }
        };
        const output = (0, fs_1.createWriteStream)(this.tempFile.name);
        this.archive.pipe(output);
        output.on('close', this.onClose);
        this.archive.on('error', this.onArchiveError);
        if (process.env.FORGE_INSPECT_ARCHIVE) {
            this.inspectDirectory = process.env.FORGE_INSPECT_ARCHIVE;
        }
    }
    addFile(fileName, contents) {
        this.archive.append(contents, { name: fileName });
        this.copyToInspect(fileName, contents);
        this.logger.debug(cli_shared_1.Text.deploy.taskPackage.packageFile(fileName, null));
    }
    addFileFrom(fileName, filePath) {
        this.archive.file(filePath, { name: fileName });
        this.copyToInspect(fileName, filePath);
        this.logger.debug(cli_shared_1.Text.deploy.taskPackage.packageFile(fileName, filePath));
    }
    copyToInspect(fileName, contents) {
        if (this.inspectDirectory) {
            const targetName = (0, path_1.join)(this.inspectDirectory, fileName);
            (0, fs_1.mkdirSync)((0, path_1.dirname)(targetName), { recursive: true });
            if (typeof contents === 'string') {
                (0, fs_1.copyFileSync)(contents, targetName);
            }
            else {
                (0, fs_1.writeFileSync)(targetName, contents);
            }
        }
    }
    finalise() {
        return new Promise((resolve, reject) => {
            this.resolves.push(resolve);
            this.rejects.push(reject);
            this.archive.finalize();
        });
    }
    onWarning(cb) {
        this.archive.on('warning', cb);
    }
    onEntry(cb) {
        this.archive.on('entry', (entry) => {
            if (entry.name) {
                cb(entry.name);
            }
        });
    }
}
exports.ZipArchiver = ZipArchiver;
