/// <reference types="node" />
import { Logger } from '@forge/cli-shared';
export interface Archiver {
    addFile(fileName: string, contents: Buffer): void;
    addFileFrom(fileName: string, filePath: string): void;
    finalise(): Promise<string>;
    onWarning(cb: (err: Error) => void): void;
    onEntry(cb: (filePath: string) => void): void;
}
export declare class ZipArchiver implements Archiver {
    private readonly logger;
    private archive;
    private tempFile;
    private resolves;
    private rejects;
    private inspectDirectory;
    constructor(logger: Logger);
    addFile(fileName: string, contents: Buffer): void;
    addFileFrom(fileName: string, filePath: string): void;
    private copyToInspect;
    finalise(): Promise<string>;
    onWarning(cb: (err: Error) => void): void;
    onEntry(cb: (filePath: string) => void): void;
    private onArchiveError;
    private onClose;
}
//# sourceMappingURL=archiver.d.ts.map