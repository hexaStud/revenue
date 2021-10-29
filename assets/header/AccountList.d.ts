import { account } from "./account";
import { IYear } from "./IYear";
export declare class AccountList {
    private static readonly storagePath;
    static login(username: string, password: string): account | false;
    static exists(username: string): boolean;
    static update(acc: account): void;
    static create(username: string, password: string): void;
    static yearExists(acc: account, year: number): boolean;
    static getYear(acc: account, year: number): IYear | false;
    static updateYearValue(acc: account, month: string, year: number, place: number, value: number): account;
    static addMonthRow(acc: account, year: number): account;
    static removeMonthRow(acc: account, year: number): account;
    static removeYear(acc: account, year: number): account;
    static changePassword(acc: account, newPsw: string): account;
    static deleteAccount(acc: account): void;
    private static getList;
    private static setList;
}
//# sourceMappingURL=AccountList.d.ts.map