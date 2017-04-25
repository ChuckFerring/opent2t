import { Transport } from "./Transport";
import { LogLevel } from "./Transport";

/**
 * Provides logging and telemetry processing functionality.
 */
export class Logger extends Transport {
    private static readonly defaultName: string = "Logger";
    private static readonly defaultLogLevel: LogLevel = LogLevel.All & ~LogLevel.Debug;

    private transportList: { [key: string]: Transport} = {};
    private transportNames: Array<string> = [];

    constructor(options: any = {}) {
        super(options.name || Logger.defaultName, options);

        if (!options.level) {
            this.level = Logger.defaultLogLevel;
        }

        if (options.transports) {
            options.transports.forEach((t: Transport) => {
                this.addTransport(t);
            });
        }
    }

    /**
     * Add a logging transport
     * If the transport has a log level of none, the global log level will be used.
     * @param {Transport} transport The transport to add
     */
    public addTransport(transport: Transport): void {
        let name = transport.name;

        if (transport.level === LogLevel.None) {
            transport.level = this.level;
        }

        if (this.transportList[name]) {
            throw new Error(`Transport already exists: ${name}`);
        }

        this.transportList[name] = transport;

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
     * Whether the logger has a transport with the specified name
     * @param {string} name The name of the transport to look for 
     */
    public hasTransport(name: string): boolean {
        return this.transportNames.indexOf(name) !== -1;
    }

    /**
     * The number of transports configured
     */
    public get transportCount(): number {
        return this.transportNames.length;
    }

    /**
     * The configured transports
     */
    public get transports(): { [key: string]: Transport} {
        return this.transportList;
    }

    /**
     * Set the global log level(s) as well as the log level(s) for all transports
     */
    public set level(newLevel: LogLevel) {
        super.level = newLevel;

        this.transportNames.forEach((name: string) => {
            this.transportList[name].level = newLevel;
        });
    }

    /**
     * Get the global log level(s)
     */
    public get level(): LogLevel {
        return super.level;
    }

    /**
     * Log an error
     * @param {string} message The error message
     * @param {*} data Error data
     */
    public error(message: string, data?: { [key: string]: any; }): void {
        this.callAllTrackingTransports(LogLevel.Error, t => t.error(message, data));
    }

    /**
     * Log a warning
     * @param {string} message The warning message
     * @param {*} data Warning data
     */
    public warn(message: string, data?: { [key: string]: any; }): void {
        this.callAllTrackingTransports(LogLevel.Warning, t => t.warn(message, data));
    }

    /**
     * Log an information message
     * @param {string} message The info message
     * @param {*} data Info message data
     */
    public info(message: string, data?: { [key: string]: any; }): void {
        this.callAllTrackingTransports(LogLevel.Info, t => t.info(message, data));
    }

    /**
     * Log a verbose message
     * @param {string} message The verbose message
     * @param {*} data Verbose message data
     */
    public verbose(message: string, data?: { [key: string]: any; }): void {
        this.callAllTrackingTransports(LogLevel.Verbose, t => t.verbose(message, data));
    }

    /**
     * Log a debug message
     * @param {string} message The debug message
     * @param {*} data Debug message data
     */
    public debug(message: string, data?: { [key: string]: any; }): void {
        this.callAllTrackingTransports(LogLevel.Debug, t => t.debug(message, data));
    }

    /**
     * Log an event
     * @param {string} name Event name
     * @param {number} duration Event duration in milliseconds
     * @param {*} data Event data
     */
    public event(name: string, duration: number, data?: { [key: string]: any; }): void {
        this.callAllTrackingTransports(LogLevel.Event, t => t.event(name, duration, data));
    }

    /**
     * Log a metric
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
     * Log an exception
     * @param {Error} exception The error that was encountered
     * @param {*} data Exception data
     */
    public exception(exception: Error, data?: { [key: string]: any; }): void {
        this.callAllTrackingTransports(LogLevel.Exception, t => t.exception(exception, data));
    }

    private callAllTrackingTransports(level: LogLevel, action: (t: Transport) => void): void {
        this.transportNames.forEach((name: string) => {
            let transportItem = this.transportList[name];

            if (transportItem.level && (transportItem.level & level)) {
                action(transportItem);
            }
        });
    }
}
