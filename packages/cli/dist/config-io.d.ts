/**
 * Read/write MCP client configs — adapted from Smithery CLI (Apache-2.0)
 * Handles the different config formats per client.
 */
import { ClientInfo } from "./clients.js";
export declare function writeClientConfig(client: ClientInfo, apiKey: string): string;
export declare function removeClientConfig(client: ClientInfo): boolean;
export declare function isClientConfigured(client: ClientInfo): boolean;
//# sourceMappingURL=config-io.d.ts.map