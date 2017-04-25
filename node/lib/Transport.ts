/**
 * The log levels available in transports
 */
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
 * Abstract base class for logging transports
 */
export abstract class Transport {
    private myLevel: LogLevel;

    constructor(public readonly name: string, options: any) {
        if (options) {
            this.myLevel = options.level || LogLevel.None;
        }
    }

    /**
     * Gets the log level(s)
     */
    public get level(): LogLevel {
        return this.myLevel;
    }

    /**
     * Sets the log level(s)
     */
    public set level(newLevel: LogLevel) {
        this.myLevel = newLevel;
    }

    /**
     * Enable additional log levels(s) if not currently enabled
     * @param {LogLevel} logLevel
     */
    public enableLogLevel(logLevel: LogLevel): void {
        this.level |= logLevel;
    }

    /**
     * Remove log level(s) if currently enabled
     * @param {LogLevel} logLevel 
     */
    public disableLogLevel(logLevel: LogLevel): void {
        this.level &= ~logLevel;
    }

    /**
     * Log an error
     * @param {string} message The error message
     * @param {*} data Error data
     */
    public abstract error(message: string, data?: { [key: string]: any; }): void;

    /**
     * Log a warning
     * @param {string} message The warning message
     * @param {*} data Warning data
     */
    public abstract warn(message: string, data?: { [key: string]: any; }): void;

    /**
     * Log an information message
     * @param {string} message The info message
     * @param {*} data Info message data
     */
    public abstract info(message: string, data?: { [key: string]: any; }): void;

    /**
     * Log a verbose message
     * @param {string} message The verbose message
     * @param {*} data Verbose message data
     */
    public abstract verbose(message: string, data?: { [key: string]: any; }): void;

    /**
     * Log a debug message
     * @param {string} message The debug message
     * @param {*} data Debug message data
     */
    public abstract debug(message: string, data?: { [key: string]: any; }): void;

    /**
     * Log an event
     * @param {string} name Event name
     * @param {number} duration Event duration in milliseconds
     * @param {*} data Event data
     */
    public abstract event(name: string, duration: number, data?: { [key: string]: any; }): void;

    /**
     * Log a metric
     * @param {string} name Metric name
     * @param {number} value Metric value
     * @param {number} count Metric count
     * @param {number} min Min value
     * @param {number} max Max value
     * @param {*} data Metric data
     */
    public abstract metric(
        name: string,
        value: number,
        count?: number,
        min?: number,
        max?: number,
        data?: { [key: string]: any; }): void;

    /**
     * Log an exception
     * @param {Error} exception The error that was encountered
     * @param {*} data Exception data
     */
    public abstract exception(exception: Error, data?: { [key: string]: any; }): void;
}
