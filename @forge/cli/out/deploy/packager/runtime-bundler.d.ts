import { Bundler, FunctionsEntryPoint } from '@forge/bundler';
import { Handler, Logger } from '@forge/cli-shared';
import { Archiver } from './archiver';
export interface RuntimeBundleResult {
    runtimeArchivePath: string;
    moduleList?: string[];
}
export declare class RuntimeBundler {
    private readonly archiverFactory;
    private readonly logger;
    private readonly bundler;
    constructor(archiverFactory: () => Archiver, logger: Logger, bundler: Bundler<FunctionsEntryPoint>);
    bundle(handlers: Handler[]): Promise<RuntimeBundleResult>;
}
//# sourceMappingURL=runtime-bundler.d.ts.map