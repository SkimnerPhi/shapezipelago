import { modImpl } from "./global_data";
import { ITEMS_HANDLING_FLAGS } from "archipelago.js";
import { processItemsPacket } from "./server_communication";
import { apDebugLog, apTry } from "./utils";
import { connection, Connection } from "./connection";

export function addInputContainer() {
    apDebugLog("Calling addInputContainer");
    modImpl.signals.stateEntered.add((state) => {
        if (state.key === "MainMenuState") {
            apDebugLog("Creating input box");
            // add input box
            const mainWrapper = document.body.getElementsByClassName("mainWrapper").item(0);
            const sideContainer = mainWrapper.getElementsByClassName("sideContainer").item(0);
            const inputContainer = document.createElement("div");
            inputContainer.className = "inputContainer";
            sideContainer.appendChild(inputContainer);
            const playerContainer = document.createElement("div");
            const addressContainer = document.createElement("div");
            const portContainer = document.createElement("div");
            const passwordContainer = document.createElement("div");
            const statusContainer = document.createElement("div");
            playerContainer.className = "playerContainer";
            addressContainer.className = "addressContainer";
            portContainer.className = "portContainer";
            passwordContainer.className = "passwordContainer";
            statusContainer.className = "statusContainer";
            inputContainer.appendChild(playerContainer);
            inputContainer.appendChild(addressContainer);
            inputContainer.appendChild(portContainer);
            inputContainer.appendChild(passwordContainer);
            inputContainer.appendChild(statusContainer);
            const playerLabel = document.createElement("h4");
            const playerInput = document.createElement("input");
            playerLabel.innerText = shapez.T.mods.shapezipelago.inputBox.player;
            playerInput.type = "text";
            playerInput.className = "playerInput";
            playerInput.value = modImpl.settings.player;
            playerContainer.appendChild(playerLabel);
            playerContainer.appendChild(playerInput);
            const addressLabel = document.createElement("h4");
            const addressInput = document.createElement("input");
            addressLabel.innerText = shapez.T.mods.shapezipelago.inputBox.address;
            addressInput.type = "text";
            addressInput.className = "addressInput";
            addressInput.value = modImpl.settings.address;
            addressContainer.appendChild(addressLabel);
            addressContainer.appendChild(addressInput);
            const portLabel = document.createElement("h4");
            const portInput = document.createElement("input");
            portLabel.innerText = shapez.T.mods.shapezipelago.inputBox.port;
            portInput.type = "number";
            portInput.value = modImpl.settings.port;
            portContainer.appendChild(portLabel);
            portContainer.appendChild(portInput);
            const passwordLabel = document.createElement("h4");
            const passwordInput = document.createElement("input");
            passwordLabel.innerText = shapez.T.mods.shapezipelago.inputBox.password;
            passwordInput.type = "password";
            passwordInput.value = modImpl.settings.password;
            passwordContainer.appendChild(passwordLabel);
            passwordContainer.appendChild(passwordInput);
            const statusLabel = document.createElement("h4");
            const statusButton = document.createElement("button");
            statusLabel.innerText = shapez.T.mods.shapezipelago.inputBox.notConnected;
            statusButton.innerText = shapez.T.mods.shapezipelago.inputBox.connect;
            statusButton.classList.add("styledButton", "statusButton");
            statusButton.addEventListener("click", () => {
                apTry("Connect click failed", () => {
                    if (!connection) {
                        modImpl.settings.player = playerInput.value;
                        modImpl.settings.address = addressInput.value;
                        modImpl.settings.port = portInput.valueAsNumber;
                        modImpl.settings.password = passwordInput.value;
                        modImpl.saveSettings();
                        const connectInfo = {
                            hostname: addressInput.value,
                            port: portInput.valueAsNumber,
                            game: "shapez",
                            name: playerInput.value,
                            items_handling: ITEMS_HANDLING_FLAGS.REMOTE_ALL,
                            password: passwordInput.value,
                        };
                        new Connection().tryConnect(connectInfo, processItemsPacket).finally(function () {
                            if (connection) {
                                statusLabel.innerText = shapez.T.mods.shapezipelago.inputBox.connected;
                                statusButton.innerText = shapez.T.mods.shapezipelago.inputBox.disconnect;
                            } else {
                                statusLabel.innerText = shapez.T.mods.shapezipelago.inputBox.failed;
                            }
                        });
                    } else {
                        connection.disconnect();
                        statusLabel.innerText = shapez.T.mods.shapezipelago.inputBox.disconnected;
                        statusButton.innerText = shapez.T.mods.shapezipelago.inputBox.connect;
                    }
                });
            });
            statusContainer.appendChild(statusLabel);
            statusContainer.appendChild(statusButton);
        }
    });
}
