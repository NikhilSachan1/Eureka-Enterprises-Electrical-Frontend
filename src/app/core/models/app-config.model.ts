export interface IAppConfig {
    name: string;
    version: string;
    description: string;
    API_CONFIG: {
        timeout: number;
        retryAttempts: number;
        retryDelay: number;
    };
    CACHE_CONFIG: {
        defaultDuration: number;
        maxEntries: number;
        cleanupInterval: number;
    };
}