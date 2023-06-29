"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const analytics_message_handler_1 = require("../analytics-client/analytics-message-handler");
const local_file_storage_1 = require("../storage/local-file-storage");
const analytics_message_worker_1 = require("./analytics-message-worker");
const worker_1 = require("./worker");
const version_check_worker_1 = require("./version-check-worker");
const cached_config_service_1 = require("../service/cached-config-service");
const cli_shared_1 = require("@forge/cli-shared");
const unique_machine_id_1 = require("../command-line/unique-machine-id");
const workerInfo = JSON.parse(process.argv[2]);
const cachedConf = cli_shared_1.CachedConf.getCache(unique_machine_id_1.FORGE_CLI_PACKAGE);
const cachedConfigService = new cached_config_service_1.CachedConfigService(cachedConf);
const ALL_WORKERS = [
    new analytics_message_worker_1.AnalyticsMessageWorker(new local_file_storage_1.LocalFileStorage(), new analytics_message_handler_1.AnalyticsMessageHandler(workerInfo ? workerInfo.environment : undefined), cachedConfigService),
    new version_check_worker_1.VersionCheckWorker(workerInfo)
];
const TIMEOUT = 10 * 1000;
(0, worker_1.handleWithTimeout)(() => Promise.all(ALL_WORKERS.map((worker) => worker.doWork())), TIMEOUT)
    .finally(() => process.exit(0))
    .catch((e) => process.exit(1));
