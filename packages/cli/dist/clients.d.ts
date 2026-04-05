/**
 * MCP client registry — adapted from Smithery CLI (Apache-2.0)
 * Maps client IDs to config file paths per OS.
 */
export type OS = "windows" | "mac" | "linux";
export type ClientId = "claude" | "cursor" | "vscode" | "vscode-insiders" | "windsurf" | "cline";
export interface ClientInfo {
    id: ClientId;
    name: string;
    configPath: Record<OS, string | null>;
}
export declare const CLIENTS: ClientInfo[];
export declare function getOS(): OS;
export declare function getClient(id: string): ClientInfo | undefined;
//# sourceMappingURL=clients.d.ts.map