"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorage = void 0;
const fs = require("fs");
const electron_1 = require("electron");
const path = require("path");
const Crypto_1 = require("./Crypto");
class LocalStorage {
    getItem(key) {
        let storage = this.load();
        if (storage[key]) {
            return storage[key];
        }
        else {
            return "";
        }
    }
    setItem(key, value) {
        let storage = this.load();
        storage[key] = value;
        this.update(storage);
    }
    hasItem(key) {
        let storage = this.load();
        return (storage[key]);
    }
    load() {
        if (fs.existsSync(LocalStorage.storagePath)) {
            let storage = fs.readFileSync(LocalStorage.storagePath, "utf8");
            storage = Crypto_1.Crypto.decode(storage, "localStorage");
            try {
                let json = JSON.parse(storage);
                if (typeof json === "object") {
                    return json;
                }
                else {
                    throw "Error on LocalStorage";
                }
            }
            catch (_a) {
                throw "Error on LocalStorage";
            }
        }
        else {
            fs.writeFileSync(LocalStorage.storagePath, Crypto_1.Crypto.encode("{}", "localStorage"));
            return {};
        }
    }
    update(storage) {
        fs.writeFileSync(LocalStorage.storagePath, Crypto_1.Crypto.encode(JSON.stringify(storage), "localStorage"));
    }
}
exports.LocalStorage = LocalStorage;
LocalStorage.storagePath = (electron_1.remote === undefined || electron_1.remote === null) ? path.join(electron_1.app.getPath("userData"), "localstorage") :
    path.join(electron_1.remote.app.getPath("userData"), "localstorage");
//# sourceMappingURL=LocalStorage.js.map