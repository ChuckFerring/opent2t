/* tslint:disable:no-console */
import {Transport} from "./Transport";
import * as colors from "colors";

function format(message: string, data?: { [key: string]: any; }): string {
    let formatted = message;

    if (data) {
        formatted += `, Data: ${JSON.stringify(data)}`;
    }

    return formatted;
}

/**
 * Logging transport that writes to the console.
 */
export class ConsoleTransport extends Transport {
    private static readonly defaultName: string = "console";

    constructor(options: any = {}) {
        super(options.name || ConsoleTransport.defaultName, options);
    }

    /**
     * Log an error to the console
     * @param {string} message The error message
     * @param {*} data Error data
     */
    public error(message: string, data?: { [key: string]: any; }): void {
        console.log(colors.red("Error: ") + format(message, data));
    }

    /**
     * Log a warning to the console
     * @param {string} message The warning message
     * @param {*} data Warning data
     */
    public warn(message: string, data?: { [key: string]: any; }): void {
        console.log(colors.yellow("Warning: ") + format(message, data));
    }

    /**
     * Log an information message to the console
     * @param {string} message The info message
     * @param {*} data Info message data
     */
    public info(message: string, data?: { [key: string]: any; }): void {
        console.log(colors.green("Info: ") + format(message, data));
    }

    /**
     * Log a verbose message to the console
     * @param {string} message The verbose message
     * @param {*} data Verbose message data
     */
    public verbose(message: string, data?: { [key: string]: any; }): void {
        console.log(colors.cyan("Verbose: ") + format(message, data));
    }

    /**
     * Log a debug message to the console
     * @param {string} message The debug message
     * @param {*} data Debug message data
     */
    public debug(message: string, data?: { [key: string]: any; }): void {
        console.log(colors.blue("Debug: ") + format(message, data));
    }

    /**
     * Log an event to the console
     * @param {string} name Event name
     * @param {number} duration Event duration in milliseconds
     * @param {*} data Event data
     */
    public event(name: string, duration: number, data?: { [key: string]: any; }): void {
        console.log(colors.green("Event: ") + `${name} ` + colors.gray(`(${duration}ms)`) + format("", data));
    }

    /**
     * Log a metric to the console
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
            console.log(colors.blue("Metric: ") + `${name}, Value: ${value}` + format("", data));
    }

    /**
     * Log an exception to the console
     * @param {Error} exception The error that was encountered
     * @param {*} data Exception data
     */
    public exception(exception: Error, data?: { [key: string]: any; }): void {
        console.log(colors.red("Exception: ") + exception + format("", data));
    }
}
