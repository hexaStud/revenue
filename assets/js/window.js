"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = require("path");
const LocalStorage_1 = require("./LocalStorage");
const update_function_1 = require("update-function");
const package_json_1 = require("../../package.json");
electron_1.app.on("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    const updater = new update_function_1.ElectronUpdater({
        url: `https://hexa-studio.de/Update/?app=UmV2ZW51ZQ%3D%3D&os=win&version=` + escape(Buffer.from(package_json_1.version).toString("base64")),
        tempName: "Revenue"
    });
    if (yield updater.downloadUpdate()) {
        updater.updateApplication();
    }
    else {
        updater.clearDownload();
    }
    const storage = new LocalStorage_1.LocalStorage();
    let win = new electron_1.BrowserWindow({
        width: 1300,
        height: 600,
        minWidth: 1300,
        minHeight: 600,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });
    console.log(electron_1.app.getPath("userData"));
    if (!storage.hasItem("fullscreen")) {
        storage.setItem("fullscreen", String(false));
    }
    win.setMenu(null);
    win.setFullScreen(storage.getItem("fullscreen") === "true");
    win.loadFile(path.join(__dirname, "..", "..", "index.html"));
    win.webContents.openDevTools({
        mode: "undocked"
    });
}));
//# sourceMappingURL=window.js.map