// Tests for the OpenT2T class
// using AVA test runner from https://github.com/avajs/ava

import test from "ava";
import * as path from "path";

import {
    AppInsightsTransport,
    ConsoleTransport,
    IThingTranslator,
    LogLevel,
    Logger,
    OpenT2T,
    OpenT2TConstants,
    OpenT2TError,
    ThingSchema,
} from "../lib";

const schemaA = "org.opent2t.test.schemas.a";
const schemaB = "org.opent2t.test.schemas.b";
const translatorOne = "org.opent2t.test.translators.one/js/thingTranslator";
const translatorTwo = "org.opent2t.test.translators.two/js/thingTranslator";

// let testLogger = new Logger();
// testLogger.addTransport(new ConsoleTransport());
// let opent2t = new OpenT2T(testLogger);
let opent2t = new OpenT2T();
let consoleTransport = new ConsoleTransport();

// Adjust for a path that is relative to the /test directory.
function testPath(modulePath: string): any {
    return path.join(__dirname, "../../test", modulePath);
}

test("Missing translator module", async t => {
    let missingTranslatorName = "this_translator_does_not_exist";
    const error: Error = await t.throws(opent2t.createTranslatorAsync(missingTranslatorName, {}), OpenT2TError);
    t.true(error.message.startsWith(OpenT2TConstants.MissingTranslator));
    t.true(error.message.endsWith(missingTranslatorName));
});

test("Load schema A", async t => {
    let thingSchemaA: ThingSchema = await opent2t.getSchemaAsync(
            testPath("./" + schemaA + "/" + schemaA));
    t.is(typeof thingSchemaA, "object");
    t.truthy(thingSchemaA);
    t.is(thingSchemaA.name, schemaA);
    t.true(Array.isArray(thingSchemaA.properties) && thingSchemaA.properties.length > 0);
    t.true(Array.isArray(thingSchemaA.methods) && thingSchemaA.methods.length > 0);

    // Extended testing on schema loading should be done by the schema reader tests.
});

test("Load schema B", async t => {
    let thingSchemaB: ThingSchema = await opent2t.getSchemaAsync(
            testPath("./" + schemaB + "/" + schemaB));
    t.is(typeof thingSchemaB, "object");
    t.truthy(thingSchemaB);
    t.is(thingSchemaB.name, schemaB);
    t.true(Array.isArray(thingSchemaB.properties) && thingSchemaB.properties.length > 0);
    t.true(Array.isArray(thingSchemaB.methods) && thingSchemaB.methods.length > 0);

    // Extended testing on schema loading should be done by the schema reader tests.
});

test("Thing One property get", async t => {
    let thingOne: IThingTranslator = await opent2t.createTranslatorAsync(
            testPath("./" + schemaA + "/" + translatorOne), {});
    t.is(typeof thingOne, "object");
    t.truthy(thingOne);
    let propA1Value = await opent2t.getPropertyAsync(thingOne, schemaA, "propA1");
    t.is(propA1Value, 123);
});

test("Thing One property set", async t => {
    let thingOne: IThingTranslator = await opent2t.createTranslatorAsync(
            testPath("./" + schemaA + "/" + translatorOne), {});
    t.is(typeof thingOne, "object");
    t.truthy(thingOne);
    await opent2t.setPropertyAsync(thingOne, schemaA, "propA2", "test2");
    let propA2Value = await opent2t.getPropertyAsync(thingOne, schemaA, "propA2");
    t.is(propA2Value, "test2");
});

test("Thing One method call + notification", async t => {
    let thingOne: IThingTranslator = await opent2t.createTranslatorAsync(
            testPath("./" + schemaA + "/" + translatorOne), {});
    t.is(typeof thingOne, "object");
    t.truthy(thingOne);
    let methodCalled: boolean = false;
    opent2t.addPropertyListener(thingOne, schemaA, "signalA", (message: string) => {
        methodCalled = true;
    });
    await opent2t.invokeMethodAsync(thingOne, schemaA, "methodA1", []);
    t.true(methodCalled);
});

test("Thing Two property get (schema A)", async t => {
    let thingTwo: IThingTranslator = await opent2t.createTranslatorAsync(
            testPath("./" + schemaB + "/" + translatorTwo), {});
    t.is(typeof thingTwo, "object");
    t.truthy(thingTwo);
    let propA1Value = await opent2t.getPropertyAsync(thingTwo, schemaA, "propA1");
    t.is(propA1Value, 123);
});

test("Thing Two property get (schema B)", async t => {
    let thingTwo: IThingTranslator = await opent2t.createTranslatorAsync(
            testPath("./" + schemaB + "/" + translatorTwo), {});
    t.is(typeof thingTwo, "object");
    t.truthy(thingTwo);
    let propA1Value = await opent2t.getPropertyAsync(thingTwo, schemaB, "propA1");
    t.is(propA1Value, 999);
});

test("Thing Two method that throws + notification", async t => {
    let thingTwo: IThingTranslator = await opent2t.createTranslatorAsync(
            testPath("./" + schemaB + "/" + translatorTwo), {});
    t.is(typeof thingTwo, "object");
    t.truthy(thingTwo);
    let methodCalled: boolean = false;
    opent2t.addPropertyListener(
            thingTwo, schemaB, "signalB", (message: string) => {
        methodCalled = true;
    });
    t.throws(opent2t.invokeMethodAsync(thingTwo, schemaB, "methodB1", []));
    t.true(methodCalled);
});

test("JSON.stringify() on OpenT2TError object returns a valid JSON object", async t => {
    let customMessage = "My custom error message";
    let innerErrorMessage = "My Inner Error is a TypeError";
    let innerError = new TypeError(innerErrorMessage);
    let error = new OpenT2TError(400, customMessage, innerError);
    let jsonObjectString = JSON.stringify(error);
    t.true(jsonObjectString.search(customMessage) >= 0);
    t.true(jsonObjectString.search(innerErrorMessage) >= 0);
    t.true(jsonObjectString.search("innerErrorStack") >= 0);
    t.true(jsonObjectString.search(innerError.name) >= 0);
});

test("Logger with default parameters can be instantiated", async t => {
    let logger = new Logger();
    t.is(logger.transportIds.length, 0, "No transports are configured by default");
    logger.addTransport(consoleTransport);
    let transportIds = logger.transportIds;
    t.is(transportIds.length, 1, "1 transport configured");
    t.is(transportIds[0], "console", "Default console log has id 'console'");
    logger.info("Writing default level to default console.");
    logger.debug("writing debug level to default console.");
});

test("Logger with multiple transports", async t => {
    let transportName = "consoleTwo";
    let logger = new Logger([consoleTransport, new ConsoleTransport(transportName)]);
    let transportIds = logger.transportIds;
    t.is(transportIds.length, 2, "2 transports configured");
    t.true(transportIds.indexOf(transportName) !== -1, "named console transport configured");
    logger.info("Writing to multiple console transports.");
});

test("Logger remove transport", async t => {
    let transportName = "consoleTwo";
    let logger = new Logger([consoleTransport, new ConsoleTransport(transportName)]);
    t.is(logger.transportIds.length, 2, "2 transports configured");
    logger.removeTransport(transportName);
    let transportIds = logger.transportIds;
    t.is(transportIds.length, 1, "1 transport configured after removal");
    t.true(transportIds.indexOf(transportName) === -1, "named console transport not configured");
    logger.info("Writing to console transport after removing second transport.");
});

test("Logger adding duplicate transport throws", async t => {
    let logger = new Logger([consoleTransport]);
    t.throws(() => logger.addTransport(new ConsoleTransport()), Error);
});

test("Logger removing non-existent transport throws", async t => {
    let logger = new Logger([consoleTransport]);
    t.throws(() => logger.removeTransport("non-existent"), Error);
});

test("Logger set log level for transport", async t => {
    let name = consoleTransport.name;
    let logger = new Logger([consoleTransport]);
    let globalLevel = logger.getLogLevel();
    let logLevel = LogLevel.None;
    logger.setLogLevel(logLevel, name);
    t.is(logger.getLogLevel(name), logLevel, "Verify log level for transport was updated.");
    t.is(logger.getLogLevel(), globalLevel, "Verify global log level was not changed.");
});

test("Logger set global log level", async t => {
    let logger = new Logger([consoleTransport]);
    let logLevel = LogLevel.None;
    logger.setLogLevel(logLevel);
    t.is(logger.getLogLevel(), logLevel, "Verify global log level was updated.");
    t.is(logger.getLogLevel(consoleTransport.name), logLevel, "Verify log level for transport was updated.");
});

test("Logger enable log level for transport", async t => {
    let name = consoleTransport.name;
    let globalLevel = LogLevel.Error | LogLevel.Warning;
    let logger = new Logger([consoleTransport], globalLevel);
    let logLevel = LogLevel.Error | LogLevel.Warning | LogLevel.Info;
    logger.enableLogLevel(LogLevel.Error | LogLevel.Info, name);
    t.is(logger.getLogLevel(name), logLevel, "Verify log level for transport was updated.");
    t.is(logger.getLogLevel(), globalLevel, "Verify global log level was not changed.");
});

test("Logger enable global log level", async t => {
    let logLevel = LogLevel.Error | LogLevel.Warning;
    let logger = new Logger([consoleTransport], logLevel);
    logLevel = LogLevel.Error | LogLevel.Warning | LogLevel.Info;
    logger.enableLogLevel(LogLevel.Error | LogLevel.Info);
    t.is(logger.getLogLevel(), logLevel, "Verify global log level was updated.");
    t.is(logger.getLogLevel(consoleTransport.name), logLevel, "Verify log level for transport was updated.");
});

test("Logger disable log level for transport", async t => {
    let name = consoleTransport.name;
    let globalLevel = LogLevel.Error | LogLevel.Warning | LogLevel.Info;
    let logger = new Logger([consoleTransport], globalLevel);
    let logLevel = LogLevel.Error | LogLevel.Warning;
    logger.disableLogLevel(LogLevel.Info | LogLevel.Verbose, name);
    t.is(logger.getLogLevel(name), logLevel, "Verify log level for transport was updated.");
    t.is(logger.getLogLevel(), globalLevel, "Verify global log level was not changed.");
});

test("Logger disable global log level", async t => {
    let logLevel = LogLevel.Error | LogLevel.Warning | LogLevel.Info;
    let logger = new Logger([consoleTransport], logLevel);
    logLevel = LogLevel.Error | LogLevel.Warning;
    logger.disableLogLevel(LogLevel.Info | LogLevel.Verbose);
    t.is(logger.getLogLevel(), logLevel, "Verify global log level was updated.");
    t.is(logger.getLogLevel(consoleTransport.name), logLevel, "Verify log level for transport was updated.");
});

test("Logger add multiple transports of different types", async t => {
    let logger = new Logger([consoleTransport, new AppInsightsTransport("test")]);
    t.is(logger.transportIds.length, 2, "Logger created with 2 transports");
});

test("Logger can log a non-primitive type", async t => {
    let logger = new Logger([consoleTransport]);
    let myArray: Array<any> = ["firstObject", "secondObject", ["nestedObj1", "nestedObj2"]];
    logger.info("Writing default level to default console.");
    logger.debug("writing debug level to default console.");
    logger.warn("Writing array object to default console", myArray);
});

test("Logger can be instantiated multiple times", async t => {
    let logger = new Logger([consoleTransport]);
    logger.info("Writing default level to default console.");
    logger.debug("writing debug level to default console.");

    /* tslint:disable:no-unused-variable */
    let logger2 = new Logger();
    /* tslint:enable:no-unused-variable */

    logger.info("2nd Logger - Writing default level to default console");
});
