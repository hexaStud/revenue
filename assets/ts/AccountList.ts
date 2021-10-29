import {account} from "./account";
import * as path from "path";
import {App, remote} from "electron";
import {Crypto} from "./Crypto";
import {LocalStorage} from "./LocalStorage";
import {IAccountList} from "./IAccountList";
import {compareSync, hashSync} from "bcrypt";
import {Session} from "./Session";
import {IYear} from "./IYear";
import {Array} from "./Utils";

const app: App = remote.app;

export class AccountList {
    private static readonly storagePath: string = path.join(app.getPath("userData"), "data");

    public static login(username: string, password: string): account | false {

        const list: IAccountList[] = this.getList();
        for (let i = 0; i < list.length; i++) {
            if (list[i].username === username) {
                if (compareSync(password, list[i].password)) {
                    return {
                        username: list[i].username,
                        password: list[i].password,
                        year: JSON.parse(Crypto.decode(list[i].data, list[i].password))
                    }
                }
            }
        }

        return false;
    }

    public static exists(username: string): boolean {
        const list: IAccountList[] = this.getList();

        for (let i = 0; i < list.length; i++) {
            if (list[i].username === username) {
                return true;
            }
        }

        return false;
    }

    public static update(acc: account) {
        const list: IAccountList[] = this.getList();

        for (let i = 0; i < list.length; i++) {
            if (acc.username === list[i].username) {
                list[i].data = Crypto.encode(JSON.stringify(acc.year), acc.password);
            }
        }

        this.setList(list);
    }

    public static create(username: string, password: string): void {
        const hash: string = hashSync(password, 4);
        const acc: IAccountList = {
            username: username,
            password: hash,
            data: Crypto.encode("[]", hash)
        }

        const list: IAccountList[] = this.getList();
        list.push(acc);
        this.setList(list);
    }

    public static yearExists(acc: account, year: number): boolean {
        for (let i = 0; i < acc.year.length; i++) {
            if (acc.year[i].number === year) {
                return true;
            }
        }

        return false;
    }

    public static getYear(acc: account, year: number): IYear | false {
        for (let i = 0; i < acc.year.length; i++) {
            if (acc.year[i].number === year) {
                return acc.year[i];
            }
        }

        return false;
    }

    public static updateYearValue(acc: account, month: string, year: number, place: number, value: number): account {
        const list: IAccountList[] = this.getList();
        for (let i = 0; i < list.length; i++) {
            if (acc.username === list[i].username) {
                const years: IYear[] = JSON.parse(Crypto.decode(list[i].data, acc.password));

                for (let k = 0; k < years.length; k++) {
                    if (years[k].number === year) {
                        // @ts-ignore
                        years[k].months[month][place] = value;

                        break;
                    }
                }
                list[i].data = Crypto.encode(JSON.stringify(years), acc.password);
                acc.year = years;
            }
        }
        this.setList(list);
        return acc;
    }

    public static addMonthRow(acc: account, year: number): account {
        const list: IAccountList[] = this.getList();
        for (let i = 0; i < list.length; i++) {
            if (list[i].username === acc.username) {
                const years: IYear[] = JSON.parse(Crypto.decode(list[i].data, acc.password));
                for (let k = 0; k < years.length; k++) {
                    if (years[k].number === year) {
                        let key = Object.keys(years[k].months);

                        for (let j = 0; j < key.length; j++) {
                            // @ts-ignore
                            years[k].months[key[j]].push(0);
                        }

                        break;
                    }
                }

                list[i].data = Crypto.encode(JSON.stringify(years), acc.password);
                acc.year = years;
                break;
            }
        }

        this.setList(list);
        return acc;
    }

    public static removeMonthRow(acc: account, year: number): account {
        const list: IAccountList[] = this.getList();
        for (let i = 0; i < list.length; i++) {
            if (list[i].username === acc.username) {
                const years: IYear[] = JSON.parse(Crypto.decode(list[i].data, acc.password));
                for (let k = 0; k < years.length; k++) {
                    if (years[k].number === year) {
                        let key = Object.keys(years[k].months);

                        for (let j = 0; j < key.length; j++) {
                            // @ts-ignore
                            let y: number[] = years[k].months[key[j]]

                            if (y.length === 1) {
                                y = [0];
                            } else {
                                y = Array.removeLastEntry(y);
                            }

                            // @ts-ignore
                            years[k].months[key[j]] = y;
                        }

                        break;
                    }
                }

                list[i].data = Crypto.encode(JSON.stringify(years), acc.password);
                acc.year = years;
                break;
            }
        }

        this.setList(list);
        return acc;
    }

    public static removeYear(acc: account, year: number): account {
        const list: IAccountList[] = this.getList();
        for (let i = 0; i < list.length; i++) {
            if (list[i].username === acc.username) {
                const years: IYear[] = JSON.parse(Crypto.decode(list[i].data, acc.password));
                const newYears: IYear[] = [];
                for (let k = 0; k < years.length; k++) {
                    if (years[k].number !== year) {
                        newYears.push(years[k]);
                    }
                }

                list[i].data = Crypto.encode(JSON.stringify(newYears), acc.password);
                acc.year = newYears;
                break;
            }
        }

        this.setList(list);
        return acc;
    }

    public static changePassword(acc: account, newPsw:string): account {
        const list: IAccountList[] = this.getList();
        for (let i = 0; i < list.length; i++) {
            if (list[i].username === acc.username) {
                let data: string = Crypto.decode(list[i].data, acc.password);
                list[i].password = hashSync(newPsw, 4);
                list[i].data = Crypto.encode(data, list[i].password);
                acc.password = list[i].password;
                break;
            }
        }

        this.setList(list);
        return acc;
    }

    public static deleteAccount(acc: account): void {
        const list: IAccountList[] = this.getList();
        let newAcc: IAccountList[] = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].username !== acc.username) {
                newAcc.push(list[i]);
            }
        }

        this.setList(newAcc);
    }

    private static getList(): IAccountList[] {
        let storage: LocalStorage = new LocalStorage();
        if (storage.hasItem("acc")) {
            let data: string = storage.getItem("acc");
            try {
                let list: IAccountList[] = JSON.parse(data);
                if (typeof list === "object") {
                    return list;
                } else {
                    return [];
                }
            } catch {
                return [];
            }
        } else {
            return [];
        }
    }

    private static setList(accounts: IAccountList[]): void {
        let storage: LocalStorage = new LocalStorage();
        storage.setItem("acc", JSON.stringify(accounts));
    }
}
