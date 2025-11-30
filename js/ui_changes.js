import { ITEMS_HANDLING_FLAGS } from "archipelago.js";
import { processItemsPacket } from "./server_communication";
import { connection, Connection } from "./connection";
import { logger } from "./main";
import { T } from "shapez/translations";

export function addInputContainer(modImpl, root) {
    logger.debug("Calling addInputContainer");

    modImpl.signals.stateEntered.add((state) => {
        if (state.key !== "MainMenuState") {
            return;
        }

        const menuAddOn = `
            <div class="inputContainer">
                <div class="playerContainer">
                    <h4>${T.mods.shapezipelago.inputBox.player}</h4>
                    <input id="shapezipelagoPlayerInput" class="playerInput" type="text" value="${modImpl.settings.player}"/>
                </div>
                <div class="addressContainer">
                    <h4>${T.mods.shapezipelago.inputBox.address}</h4>
                    <input id="shapezipelagoAddressInput" class="addressInput" type="text" value="${modImpl.settings.address}"/>
                </div>
                <div class="portContainer">
                    <h4>${T.mods.shapezipelago.inputBox.port}</h4>
                    <input id="shapezipelagoPortInput" type="number" value="${modImpl.settings.port}"/>
                </div>
                <div class="passwordContainer">
                    <h4>${T.mods.shapezipelago.inputBox.password}</h4>
                    <input id="shapezipelagoPasswordInput" type="text" value="${modImpl.settings.password}"/>
                </div>
                <div class="statusContainer">
                    <h4 id="shapezipelagoConnectionStatus">${T.mods.shapezipelago.inputBox.notConnected}</h4>
                    <button id="shapezipelagoConnectButton" class="styledButton statusButton">${T.mods.shapezipelago.inputBox.connect}</button>
                </div>
            </div>
        `;

        const mainWrapper = document.body.getElementsByClassName("mainWrapper").item(0);
        const sideContainer = mainWrapper.getElementsByClassName("sideContainer").item(0);
        sideContainer.insertAdjacentHTML("beforeend", menuAddOn);

        document.getElementById("shapezipelagoConnectButton").addEventListener("click", () => {
            const statusLabel = document.getElementById("shapezipelagoStatusLabel");
            const statusButton = document.getElementById("shapezipelagoConnectButton");

            if (connection) {
                connection.disconnect();
                statusLabel.innerText = T.mods.shapezipelago.inputBox.disconnected;
                statusButton.innerText = T.mods.shapezipelago.inputBox.connect;
                return;
            }

            const player = document.getElementById("shapezipelagoPlayerInput").value;
            const address = document.getElementById("shapezipelagoAddressInput").value;
            const port = document.getElementById("shapezipelagoAddressInput").valueAsNumber;
            const password = document.getElementById("shapezipelagoAddressInput").value;

            modImpl.settings.player = player;
            modImpl.settings.address = address;
            modImpl.settings.port = port;
            modImpl.settings.password = password;
            modImpl.saveSettings();

            const connectInfo = {
                game: "shapez",
                player,
                hostname: address,
                port,
                password,
                items_handling: ITEMS_HANDLING_FLAGS.REMOTE_ALL,
            };

            new Connection()
                .tryConnect(connectInfo, (packet) => processItemsPacket(root, packet))
                .finally(() => {
                    if (connection) {
                        statusLabel.innerText = T.mods.shapezipelago.inputBox.connected;
                        statusButton.innerText = T.mods.shapezipelago.inputBox.disconnect;
                    } else {
                        statusLabel.innerText = T.mods.shapezipelago.inputBox.failed;
                    }
                });
        });
    });
}
