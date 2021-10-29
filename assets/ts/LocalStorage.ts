import * as fs from "fs";
import {app, remote} from "electron";
import * as path from "path";
import {Crypto} from "./Crypto";

export class LocalStorage {
    private static storagePath = (remote === undefined || remote === null) ? path.join(app.getPath("userData"), "localstorage") :
        path.join(remote.app.getPath("userData"), "localstorage");

    public getItem(key: string): string {
        let storage: any = this.load();
        if (storage[key]) {
            return storage[key];
        } else {
            return "";
        }
    }

    public setItem(key:string, value: string): void {
        let storage: any = this.load();

        storage[key] = value;
        this.update(storage);
    }

    public hasItem(key:string): boolean {
        let storage = this.load();
        return (storage[key]);
    }

    private load(): any {
        if (fs.existsSync(LocalStorage.storagePath)) {
            let storage: string = fs.readFileSync(LocalStorage.storagePath, "utf8");
            storage = Crypto.decode(storage, "localStorage");
            try {
                let json: any = JSON.parse(storage);
                if (typeof json === "object") {
                    return json;
                } else {
                    throw "Error on LocalStorage";
                }
            } catch {
                throw "Error on LocalStorage";
            }
        } else {
            fs.writeFileSync(LocalStorage.storagePath, Crypto.encode("{}", "localStorage"));
            return {};
        }
    }

    private update(storage: any): void {
        fs.writeFileSync(LocalStorage.storagePath, Crypto.encode(JSON.stringify(storage), "localStorage"));
    }
}
