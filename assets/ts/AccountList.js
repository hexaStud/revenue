"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountList = void 0;
const path = require("path");
const electron_1 = require("electron");
const Crypto_1 = require("./Crypto");
const LocalStorage_1 = require("./LocalStorage");
const bcrypt_1 = require("bcrypt");
const Utils_1 = require("./Utils");
const app = electron_1.remote.app;
class AccountList {
    static login(username, password) {
        const list = this.getList();
        for (let i = 0; i < list.length; i++) {
            if (list[i].username === username) {
                if (bcrypt_1.compareSync(password, list[i].password)) {
                    return {
                        username: list[i].username,
                        password: list[i].password,
                        year: JSON.parse(Crypto_1.Crypto.decode(list[i].data, list[i].password))
                    };
                }
            }
        }
        return false;
    }
    static exists(username) {
        const list = this.getList();
        for (let i = 0; i < list.length; i++) {
            if (list[i].username === username) {
                return true;
            }
        }
        return false;
    }
    static update(acc) {
        const list = this.getList();
        for (let i = 0; i < list.length; i++) {
            if (acc.username === list[i].username) {
                list[i].data = Crypto_1.Crypto.encode(JSON.stringify(acc.year), acc.password);
            }
        }
        this.setList(list);
    }
    static create(username, password) {
        const hash = bcrypt_1.hashSync(password, 4);
        const acc = {
            username: username,
            password: hash,
            data: Crypto_1.Crypto.encode("[]", hash)
        };
        const list = this.getList();
        list.push(acc);
        this.setList(list);
    }
    static yearExists(acc, year) {
        for (let i = 0; i < acc.year.length; i++) {
            if (acc.year[i].number === year) {
                return true;
            }
        }
        return false;
    }
    static getYear(acc, year) {
        for (let i = 0; i < acc.year.length; i++) {
            if (acc.year[i].number === year) {
                return acc.year[i];
            }
        }
        return false;
    }
    static updateYearValue(acc, month, year, place, value) {
        const list = this.getList();
        for (let i = 0; i < list.length; i++) {
            if (acc.username === list[i].username) {
                const years = JSON.parse(Crypto_1.Crypto.decode(list[i].data, acc.password));
                for (let k = 0; k < years.length; k++) {
                    if (years[k].number === year) {
                        years[k].months[month][place] = value;
                        break;
                    }
                }
                list[i].data = Crypto_1.Crypto.encode(JSON.stringify(years), acc.password);
                acc.year = years;
            }
        }
        this.setList(list);
        return acc;
    }
    static addMonthRow(acc, year) {
        const list = this.getList();
        for (let i = 0; i < list.length; i++) {
            if (list[i].username === acc.username) {
                const years = JSON.parse(Crypto_1.Crypto.decode(list[i].data, acc.password));
                for (let k = 0; k < years.length; k++) {
                    if (years[k].number === year) {
                        let key = Object.keys(years[k].months);
                        for (let j = 0; j < key.length; j++) {
                            years[k].months[key[j]].push(0);
                        }
                        break;
                    }
                }
                list[i].data = Crypto_1.Crypto.encode(JSON.stringify(years), acc.password);
                acc.year = years;
                break;
            }
        }
        this.setList(list);
        return acc;
    }
    static removeMonthRow(acc, year) {
        const list = this.getList();
        for (let i = 0; i < list.length; i++) {
            if (list[i].username === acc.username) {
                const years = JSON.parse(Crypto_1.Crypto.decode(list[i].data, acc.password));
                for (let k = 0; k < years.length; k++) {
                    if (years[k].number === year) {
                        let key = Object.keys(years[k].months);
                        for (let j = 0; j < key.length; j++) {
                            let y = years[k].months[key[j]];
                            if (y.length === 1) {
                                y = [0];
                            }
                            else {
                                y = Utils_1.Array.removeLastEntry(y);
                            }
                            years[k].months[key[j]] = y;
                        }
                        break;
                    }
                }
                list[i].data = Crypto_1.Crypto.encode(JSON.stringify(years), acc.password);
                acc.year = years;
                break;
            }
        }
        this.setList(list);
        return acc;
    }
    static removeYear(acc, year) {
        const list = this.getList();
        for (let i = 0; i < list.length; i++) {
            if (list[i].username === acc.username) {
                const years = JSON.parse(Crypto_1.Crypto.decode(list[i].data, acc.password));
                const newYears = [];
                for (let k = 0; k < years.length; k++) {
                    if (years[k].number !== year) {
                        newYears.push(years[k]);
                    }
                }
                list[i].data = Crypto_1.Crypto.encode(JSON.stringify(newYears), acc.password);
                acc.year = newYears;
                break;
            }
        }
        this.setList(list);
        return acc;
    }
    static changePassword(acc, newPsw) {
        const list = this.getList();
        for (let i = 0; i < list.length; i++) {
            if (list[i].username === acc.username) {
                let data = Crypto_1.Crypto.decode(list[i].data, acc.password);
                list[i].password = bcrypt_1.hashSync(newPsw, 4);
                list[i].data = Crypto_1.Crypto.encode(data, list[i].password);
                acc.password = list[i].password;
                break;
            }
        }
        this.setList(list);
        return acc;
    }
    static deleteAccount(acc) {
        const list = this.getList();
        let newAcc = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].username !== acc.username) {
                newAcc.push(list[i]);
            }
        }
        this.setList(newAcc);
    }
    static getList() {
        let storage = new LocalStorage_1.LocalStorage();
        if (storage.hasItem("acc")) {
            let data = storage.getItem("acc");
            try {
                let list = JSON.parse(data);
                if (typeof list === "object") {
                    return list;
                }
                else {
                    return [];
                }
            }
            catch (_a) {
                return [];
            }
        }
        else {
            return [];
        }
    }
    static setList(accounts) {
        let storage = new LocalStorage_1.LocalStorage();
        storage.setItem("acc", JSON.stringify(accounts));
    }
}
exports.AccountList = AccountList;
AccountList.storagePath = path.join(app.getPath("userData"), "data");
//# sourceMappingURL=AccountList.js.map