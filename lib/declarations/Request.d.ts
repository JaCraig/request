import { Cache, CacheEntryOptions, StorageProvider, IndexedDbStorageProvider } from "./Cache";
declare class CancellationToken {
    canceled: boolean;
}
interface AuthenticationProvider {
    authenticate(request: Request): Promise<void>;
    authenticationFailed(request: Request, reason: Response): Promise<void>;
}
interface RequestOptions {
    authenticationProvider?: AuthenticationProvider;
    cacheKey?: string;
    cancellationToken?: CancellationToken;
    credentials?: RequestCredentials;
    data?: any;
    error?: (reason: any) => void;
    headers?: Record<string, string>;
    method: string;
    parser?: (response: Response) => Promise<any>;
    retry?: (attempt: number) => void;
    retryAttempts?: number;
    retryDelay?: number;
    serializer?: (data: any) => string;
    storageMode?: StorageMode;
    success?: (response: any) => void;
    timeout?: number;
    url: string;
}
declare class Request {
    private options;
    private abortController;
    constructor(options: RequestOptions);
    static get(url: string, data?: any): Request;
    static post(url: string, data?: any): Request;
    static put(url: string, data?: any): Request;
    static delete(url: string, data?: any): Request;
    static ofType(method: string, url: string, data?: any): Request;
    withAuthenticationProvider(authenticationProvider: AuthenticationProvider): this;
    withHeaders(headers: Record<string, string>): this;
    withCancellationToken(cancellationToken: CancellationToken): this;
    withCredentials(credentials: RequestCredentials): this;
    withSerializer(serializer: (data: any) => string): this;
    withParser(parser: (response: Response) => Promise<any>): this;
    onSuccess(callback: (response: any) => void): this;
    onError(callback: (reason: any) => void): this;
    onRetry(callback: (attempt: number) => void): this;
    withStorageMode(storageMode: StorageMode): this;
    withCacheKey(cacheKey: string): this;
    withTimeout(timeout?: number): this;
    withRetryAttempts(retryAttempts: number): this;
    withRetryDelay(retryDelay: number): this;
    abort(): this;
    send(): Promise<any>;
    private handleTimeout;
}
declare enum StorageMode {
    NetworkFirst = 0,
    StorageFirst = 1,
    NetworkOnly = 2,
    StorageAndUpdate = 3
}
export { CancellationToken, AuthenticationProvider, RequestOptions, Request, StorageMode, Cache, CacheEntryOptions, StorageProvider, IndexedDbStorageProvider };
//# sourceMappingURL=Request.d.ts.map