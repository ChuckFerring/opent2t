import { ITransport } from "./ITransport";
import * as applicationinsights from "applicationinsights";
const uuidv4 = require("uuid/v4");

enum TraceLevel {
    Verbose = 0,
    Info = 1,
    Warn = 2,
    Error = 3
}

export class AppInsightsTransport implements ITransport {

    private client: any;

    constructor(key: string, public readonly name: string = "appInsights") {
        this.client = applicationinsights.getClient(key);
        let sessionKey = this.client.context.keys.sessionId;
        this.client.context.tags[sessionKey] = uuidv4();
    }

    public error(message: string, data?: { [key: string]: any; }): void {
        this.trace(message, TraceLevel.Error);
    }

    public warn(message: string, data?: { [key: string]: any; }): void {
        this.trace(message, TraceLevel.Warn);
    }

    public info(message: string, data?: { [key: string]: any; }): void {
        this.trace(message, TraceLevel.Info);
    }

    public verbose(message: string, data?: { [key: string]: any; }): void {
        this.trace(message, TraceLevel.Verbose);
    }

    public debug(message: string, data?: { [key: string]: any; }): void {
        this.trace(message, TraceLevel.Verbose);
    }

    public event(name: string, duration: number, data?: { [key: string]: any; }): void {
        let properties = this.createProperties(data);
        properties.duration = duration.toString();
        this.client.trackEvent(name, properties);
    }

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
