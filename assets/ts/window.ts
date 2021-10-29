import {app, BrowserWindow} from "electron";
import * as path from "path";
import {LocalStorage} from "./LocalStorage";


app.on("ready", async () => {
    // TODO write Updater;

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
