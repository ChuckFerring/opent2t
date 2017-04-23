export interface ITransport {
    readonly name: string;
    error(message: string, data?: { [key: string]: any; }): void;
    warn(message: string, data?: { [key: string]: any; }): void;
    info(message: string, data?: { [key: string]: any; }): void;
    verbose(message: string, data?: { [key: string]: any; }): void;
    debug(message: string, data?: { [key: string]: any; }): void;
    event(name: string, duration: number, data?: { [key: string]: any; }): void;
    metric(
        name: string,
        value: number,
        count?: number,
        min?: number,
        max?: number,
        data?: { [key: string]: any; }): void;
    exception(exception: Error, data?: { [key: string]: any; }): void;
}
