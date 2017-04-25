import { Transport } from "./Transport";
import * as applicationinsights from "applicationinsights";
const uuidv4 = require("uuid/v4");

enum TraceLevel {
    Verbose = 0,
    Info = 1,
    Warn = 2,
    Error = 3
}

/**
 * Logging transport that writes to application insights
 */
export class AppInsightsTransport extends Transport {
    private static readonly defaultName: string = "appInsights";

    private client: any;

    constructor(options: any) {
        if (!(options && options.key)) {
            throw new Error("Cannot log to application insights without a key.");
        }

        super(options.name || AppInsightsTransport.defaultName, options);
        this.client = applicationinsights.getClient(options.key);
        let sessionKey = this.client.context.keys.sessionId;
        this.client.context.tags[sessionKey] = uuidv4();
    }

    /**
     * Log an error to application insights
     * @param {string} message The error message
     * @param {*} data Error data
     */
    public error(message: string, data?: { [key: string]: any; }): void {
        this.trace(message, TraceLevel.Error);
    }

    /**
     * Log a warning to application insights
     * @param {string} message The warning message
     * @param {*} data Warning data
     */
    public warn(message: string, data?: { [key: string]: any; }): void {
        this.trace(message, TraceLevel.Warn);
    }

    /**
     * Log an information message to application insights
     * @param {string} message The info message
     * @param {*} data Info message data
     */
    public info(message: string, data?: { [key: string]: any; }): void {
        this.trace(message, TraceLevel.Info);
    }

    /**
     * Log a verbose message to application insights
     * @param {string} message The verbose message
     * @param {*} data Verbose message data
     */
    public verbose(message: string, data?: { [key: string]: any; }): void {
        this.trace(message, TraceLevel.Verbose);
    }

    /**
     * Log a debug message to application insights
     * @param {string} message The debug message
     * @param {*} data Debug message data
     */
    public debug(message: string, data?: { [key: string]: any; }): void {
        this.trace(message, TraceLevel.Verbose);
    }

    /**
     * Log an event to application insights
     * @param {string} name Event name
     * @param {number} duration Event duration in milliseconds
     * @param {*} data Event data
     */
    public event(name: string, duration: number, data?: { [key: string]: any; }): void {
        let properties = this.createProperties(data);
        properties.duration = duration.toString();
        this.client.trackEvent(name, properties);
    }

    /**
     * Log a metric to application insights
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
        let properties = this.createProperties(data);
        this.client.trackMetric(name, value, count, min, max, undefined, properties);
    }

    /**
     * Log an exception to application insights
     * @param {Error} exception The error that was encountered
     * @param {*} data Exception data
     */
    public exception(exception: Error, data?: { [key: string]: any; }): void {
        let properties = this.createProperties(data);
        this.client.trackException(exception, properties);
    }

    private trace(message: string, traceLevel: TraceLevel, data?: { [key: string]: any; }): void {
        let properties = this.createProperties(data);
        this.client.trackTrace(message, traceLevel, properties);
    }

    private createProperties(data?: { [key: string]: any; }): { [key: string]: string; } {
        let properties: { [key: string]: string; } = {};

        if (data) {
            for (let attr in data) {
                if (data.hasOwnProperty(attr)) {
                    properties[attr] = data[attr].toString();
                }
            }
        }

        return properties;
    }
}
