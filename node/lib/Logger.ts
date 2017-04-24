import { ITransport } from "./ITransport";

export enum LogLevel {
    None =      0,
    Error =     1,
    Warning =   1 << 1,
    Info =      1 << 2,
    Verbose =   1 << 3,
    Debug =     1 << 4,
    Event =     1 << 5,
    Metric =    1 << 6,
    Exception = 1 << 7,
    All =       LogLevel.Error |
                    LogLevel.Warning |
                    LogLevel.Info |
                    LogLevel.Verbose |
                    LogLevel.Debug |
                    LogLevel.Event |
                    LogLevel.Metric |
                    LogLevel.Exception
}

/**
 * Provides logging and telemetry processing functionality.
 */
export class Logger {
    private globalLogLevel: LogLevel = LogLevel.All & ~LogLevel.Debug;
    private transportList: { [key: string]: { transport: ITransport, level: LogLevel }} = {};
    private transportNames: Array<string> = [];

    constructor(transports?: Array<ITransport>, logLevel?: LogLevel) {
        if (logLevel) {
            this.globalLogLevel = logLevel;
        }

        if (transports) {
            transports.forEach(t => {
                this.addTransport(t);
            });
        }
    }

    /**
     * Sets the log level of a transport if a transport is specified,
     * Otherwise sets the global log level as well as the log level of all transports
     * @param {LogLevel} logLevel The LogLevel to set
     * @param {string} transportName The name of the transport whose log level will be set
     */
    public setLogLevel(logLevel: LogLevel, transportName?: string): void {
        if (transportName) {
            let transportItem = this.transportList[transportName];
            if (!transportItem) {
                throw new Error(`Transport not found: ${transportName}`);
            }

            transportItem.level = logLevel;
        } else {
            this.globalLogLevel = logLevel;

            this.transportNames.forEach((name: string) => {
                this.transportList[name].level = logLevel;
            });
        }
    }

    /**
     * Gets the global log level or the log level of a transport if specified
     * @param {string} transportName The name of the transport whose log level will be returned
     */
    public getLogLevel(transportName?: string): LogLevel {
        if (transportName) {
            let transportItem = this.transportList[transportName];
            if (!transportItem) {
                throw new Error(`Transport not found: ${transportName}`);
            }

            return transportItem.level;
        }

        return this.globalLogLevel;
    }

    /**
     * enables additional log levels of a transport if a transport is specified,
     * Otherwise enables additional log levels of the global log level as well as the log level of all transports 
     * @param logLevel 
     * @param transportName 
     */
    public enableLogLevel(logLevel: LogLevel, transportName?: string): void {
        this.setLogLevel(this.getLogLevel(transportName) | logLevel, transportName );
    }

    /**
     * disables specified log levels of a transport if a transport is specified,
     * Otherwise disables specified log levels of the global log level as well as the log level of all transports 
     * @param logLevel 
     * @param transportName 
     */
    public disableLogLevel(logLevel: LogLevel, transportName?: string): void {
        this.setLogLevel(this.getLogLevel(transportName) & ~logLevel, transportName );
    }

    /**
     * Add a logging transport
     * @param {ITransport} transport The transport to add
     * @param {LogLevel} level The logging level for the transport
     */
    public addTransport(transport: ITransport, level: LogLevel = this.globalLogLevel): void {
        let name = transport.name;

        if (this.transportList[name]) {
            throw new Error(`Transport already exists: ${name}`);
        }

        this.transportList[name] = {transport, level};

        if (this.transportNames.indexOf(name) === -1) {
            this.transportNames.push(name);
        }
    }

    /**
     * Remove a logging transport
     * @param {string} name The name of the transport to remove
     */
    public removeTransport(name: string): void {
        if (!this.transportList[name]) {
            throw new Error(`Transport not found: ${name}`);
        }

        delete this.transportList[name];

        let index = this.transportNames.indexOf(name);
        if (index > -1) {
            this.transportNames.splice(index, 1);
        }
    }

    /**
     * Returns the identifiers of the configured transports
     */
    get transportIds(): Array<string> {
        return this.transportNames.slice();
    }

    /**
     * Emit an error
     * @param {string} message The error message
     * @param {*} data Error data
     */
    public error(message: string, data?: { [key: string]: any; }): void {
        this.callAllTrackingTransports(LogLevel.Error, t => t.error(message, data));
    }

    /**
     * Emit a warning
     * @param {string} message The warning message
     * @param {*} data Warning data
     */
    public warn(message: string, data?: { [key: string]: any; }): void {
        this.callAllTrackingTransports(LogLevel.Warning, t => t.warn(message, data));
    }

    /**
     * Emit an information message
     * @param {string} message The info message
     * @param {*} data Info message data
     */
    public info(message: string, data?: { [key: string]: any; }): void {
        this.callAllTrackingTransports(LogLevel.Info, t => t.info(message, data));
    }

    /**
     * Emit a verbose message
     * @param {string} message The verbose message
     * @param {*} data Verbose message data
     */
    public verbose(message: string, data?: { [key: string]: any; }): void {
        this.callAllTrackingTransports(LogLevel.Verbose, t => t.verbose(message, data));
    }

    /**
     * Emit a debug message
     * @param {string} message The debug message
     * @param {*} data Debug message data
     */
    public debug(message: string, data?: { [key: string]: any; }): void {
        this.callAllTrackingTransports(LogLevel.Debug, t => t.debug(message, data));
    }

    /**
     * Emit a telemetry event
     * @param {string} name Event name
     * @param {number} duration Event duration in milliseconds
     * @param {*} data Event data
     */
    public event(name: string, duration: number, data?: { [key: string]: any; }): void {
        this.callAllTrackingTransports(LogLevel.Event, t => t.event(name, duration, data));
    }

    /**
     * Emit a telemetry metric
     * @param {string} name Metric name
     * @param {number} value Metric value
     * @param {number} count Metric count
     * @param {number} min Min value
     * @param {number} max Max value
     * @param {*} data Metric data
     */
    public metric(
        name: string,
        value: number,
        count?: number,
        min?: number,
        max?: number,
        data?: { [key: string]: any; }): void {
        this.callAllTrackingTransports(LogLevel.Metric, t => t.metric(name, value, count, min, max, data));
    }

    /**
     * Emit a telemetry exception
     * @param {Error} exception The error that was encountered
     * @param {*} data Exception data
     */
    public exception(exception: Error, data?: { [key: string]: any; }): void {
        this.callAllTrackingTransports(LogLevel.Exception, t => t.exception(exception, data));
    }

    private callAllTrackingTransports(level: LogLevel, action: (tracker: ITransport) => void): void {
        this.transportNames.forEach((name: string) => {
            let transportItem = this.transportList[name];

            if (transportItem.level & level) {
                action(transportItem.transport);
            }
        });
    }
}
