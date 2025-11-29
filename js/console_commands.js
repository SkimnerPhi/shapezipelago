import { checkLocation, receiveItemFunctions } from "./server_communication";
import { connection } from "./connection";
import { currentIngame } from "./ingame";
import { logger, modImpl } from "./main";

export function addCommands() {
    logger.debug("Calling addCommands");
    globalThis.AP = {};
    // Objects
    globalThis.AP.connenction = () => {
        return connection;
    };
    globalThis.AP.currentIngame = () => {
        return currentIngame;
    };
    globalThis.AP.receiveItemFunctions = () => {
        return receiveItemFunctions;
    };
    globalThis.AP.shapez = () => {
        return shapez;
    };
    globalThis.AP.modImpl = () => {
        return modImpl;
    };
    // Commands
    globalThis.AP.printLevels = (level = null) => {
        let text = "";
        if (level) {
            const def = currentIngame.levelDefs[level - 1];
            text += `${def.required}x ${def.shape}${def.throughputOnly ? " throughput" : ""}`;
        } else {
            let count = 1;
            for (const def of currentIngame.levelDefs) {
                text += `Level ${count++}: ${def.required}x ${def.shape}${
                    def.throughputOnly ? " throughput" : ""
                }<br />`;
            }
        }
        modImpl.dialogs.showInfo("Levels debug", text);
    };
    globalThis.AP.sendAPMessage = (message) => {
        connection.client.say(message);
    };
    globalThis.AP.enableDebug = (password) => {
        connection.debug -= password;
    };
    globalThis.AP.debugCheck = (name, goal = false) => {
        if (!connection.debug) {
            checkLocation("Debugged", goal, name);
        } else {
            connection.client.say("Oops");
        }
    };
    globalThis.AP.setDebugSetting = (name, value) => {
        modImpl.dialogs.showInfo("Important", `Are you sure what you're doing!? Set ${name} to ${value}`);
        modImpl.settings[name] = value;
        modImpl.saveSettings();
    };
}
