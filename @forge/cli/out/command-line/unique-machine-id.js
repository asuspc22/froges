"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMachineId = exports.FORGE_CLI_PACKAGE = void 0;
const tslib_1 = require("tslib");
const uuid_1 = tslib_1.__importDefault(require("uuid"));
const node_machine_id_1 = require("node-machine-id");
const cli_shared_1 = require("@forge/cli-shared");
exports.FORGE_CLI_PACKAGE = '@forge/cli';
const MACHINE_ID_CACHE_KEY = 'machineId';
const generateMachineId = () => {
    try {
        return (0, node_machine_id_1.machineIdSync)();
    }
    catch (e) {
        return (0, uuid_1.default)();
    }
};
const getMachineId = () => cli_shared_1.CachedConf.getCache(exports.FORGE_CLI_PACKAGE).cached(MACHINE_ID_CACHE_KEY, generateMachineId);
exports.getMachineId = getMachineId;
