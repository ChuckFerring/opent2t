/* tslint:disable:no-console */
import {ITransport} from "./ITransport";
import * as colors from "colors";

function format(message: string, data?: { [key: string]: any; }): string {
    let formatted = message;

    if (data) {
        formatted += `, Data: ${JSON.stringify(data)}`;
    }

    return formatted;
}

/**
 * Telemetry tracking transport that writes data to the console.  This is mostly useful for debugging.
 */
export class ConsoleTransport implements ITransport {

    constructor(public readonly name: string = "console") {}

    public error(message: string, data?: { [key: string]: any; }): void {
        console.log(colors.red("Error: ") + format(message, data));
    }

    public warn(message: string, data?: { [key: string]: any; }): void {
        console.log(colors.yellow("Warning: ") + format(message, data));
    }

    public info(message: string, data?: { [key: string]: any; }): void {
        console.log(colors.green("Info: ") + format(message, data));
    }

    public verbose(message: string, data?: { [key: string]: any; }): void {
        console.log(colors.cyan("Verbose: ") + format(message, data));
    }

    public debug(message: string, data?: { [key: string]: any; }): void {
        console.log(colors.blue("Debug: ") + format(message, data));
    }

    public event(name: string, duration: number, data?: { [key: string]: any; }): void {
        console.log(colors.green("Event: ") + `${name} ` + colors.gray(`(${duration}ms)`) + format("", data));
    }

    public metric(
        name: string,
        value: number,
        count?: number,
        min?: number,
        max?: number,
        data?: { [key: string]: any; }): void {
            console.log(colors.blue("Metric: ") + `${name}, Value: ${value}` + format("", data));
    }

    public exception(exception: Error, data?: { [key: string]: any; }): void {
        console.log(colors.red("Exception: ") + exception + format("", data));
    }
}
