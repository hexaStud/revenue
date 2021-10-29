import {app, BrowserWindow} from "electron";
import * as path from "path";
import {LocalStorage} from "./LocalStorage";
import {ElectronUpdater} from "update-function";
import {version} from "../../package.json";


app.on("ready", async () => {
    const updater: ElectronUpdater = new ElectronUpdater({
        url: `https://hexa-studio.de/Update/?app=UmV2ZW51ZQ%3D%3D&os=win&version=` + escape(Buffer.from(version).toString("base64")),
        tempName: "Revenue"
    });

    if (await updater.downloadUpdate()) {
        updater.updateApplication();
    } else {
        updater.clearDownload();
    }

    const storage: LocalStorage = new LocalStorage();
    let win: BrowserWindow = new BrowserWindow({
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

    console.log(app.getPath("userData"));

    if (!storage.hasItem("fullscreen")) {
        storage.setItem("fullscreen", String(false));
    }
    win.setMenu(null);

    win.setFullScreen(storage.getItem("fullscreen") === "true");
    win.loadFile(path.join(__dirname, "..", "..", "index.html"));
    win.webContents.openDevTools({
        mode: "undocked"
    });


});
