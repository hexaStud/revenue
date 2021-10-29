import {Chart} from "chart.js";
import {AccountList} from "./AccountList";
import {Session} from "./Session";
import {account} from "./account";
import {BrowserWindow, Dialog, remote} from "electron";
import {IYear} from "./IYear";
import {compareSync} from "bcrypt";
import {LocalStorage} from "./LocalStorage";
import * as fs from "fs";

const dialog: Dialog = remote.dialog;

let yearStat: Chart;
let monthStat: Chart;
let uiTarget: string;

function logout(): void {
    Session.account = {
        password: "",
        year: [],
        username: ""
    };
    Session.yearNumber = 0;

    loadLogin();
}

function loadHome(): void {
    (<HTMLElement>document.getElementById("informationUi")).style.display = "none";
    (<HTMLElement>document.getElementById("yearsUi")).style.display = "";

    loadYearUiData();

    (<HTMLElement>document.getElementById("loginView")).style.setProperty("display", "none", "important");
    (<HTMLElement>document.getElementById("newView")).style.setProperty("display", "none", "important");
    (<HTMLElement>document.getElementById("homeView")).style.display = "";
}

function loadLogin(): void {
    (<HTMLElement>document.getElementById("informationUi")).style.display = "none";
    (<HTMLElement>document.getElementById("yearsUi")).style.display = "none";

    (<HTMLElement>document.getElementById("newView")).style.setProperty("display", "none", "important");
    (<HTMLElement>document.getElementById("homeView")).style.setProperty("display", "none", "important");
    (<HTMLElement>document.getElementById("loginView")).style.display = "";
}

function loadInformationUiData(): void {
    const year: IYear = <IYear>AccountList.getYear(Session.account, Session.yearNumber);
    const data: number[] = [];
    const labels: string[] = Object.keys(year.months);

    for (let i = 0; i < labels.length; i++) {
        let value: number = 0;
        // @ts-ignore
        for (let k = 0; k < year.months[labels[i]].length; k++) {
            // @ts-ignore
            value += year.months[labels[i]][k];
        }

        data.push(value);
        labels[i] = labels[i].replace(labels[i][0], labels[i][0].toUpperCase());
    }

    monthStat.data.labels = labels;
    monthStat.data.datasets[0].data = data;
    monthStat.update();

    const keys: string[] = Object.keys(year.months);
    const tableBody: HTMLElement = <HTMLElement>document.getElementById("informationUiDataTableBody");
    const tableFooter: HTMLElement = <HTMLElement>document.getElementById("informationUiDataTableFooter");

    tableBody.innerHTML = "";

    for (let i = 0; i < year.months.jan.length; i++) {
        const tr: HTMLTableRowElement = document.createElement("tr");

        for (let k = 0; k < keys.length; k++) {
            const td: HTMLTableDataCellElement = document.createElement("td");
            // @ts-ignore
            td.innerHTML = year.months[keys[k]][i].toString();
            tr.appendChild(td);
        }

        tableBody.appendChild(tr);
    }

    tableFooter.innerHTML = "";

    let completeValue: number = 0;

    let tr: HTMLTableRowElement = document.createElement("tr");
    for (let i = 0; i < data.length; i++) {
        const td: HTMLTableDataCellElement = document.createElement("td");
        td.innerHTML = data[i].toString();
        tr.appendChild(td);

        completeValue += data[i];
    }

    tableFooter.appendChild(tr);

    tr = document.createElement("tr");
    let td: HTMLTableDataCellElement = document.createElement("td");
    td.innerHTML = completeValue.toString();
    td.colSpan = 12;
    tr.appendChild(td);
    tableFooter.appendChild(tr);

}

function loadYearUi(): void {
    // TODO add animation
    (<HTMLElement>document.getElementById("informationUi")).style.setProperty("display", "none", "important");

    loadYearUiData();

    (<HTMLElement>document.getElementById("yearsUi")).style.display = "";
    uiTarget = "yearUi";
}

function loadYearUiData(): void {
    const labels: string[] = [];
    const data: number[] = [];

    Session.account.year.sort((a: IYear, b: IYear): number => {
        if (a.number < b.number) {
            return 1;
        } else if (a.number > b.number) {
            return -1;
        } else {
            return 0;
        }
    });

    for (let i = 0; i < Session.account.year.length; i++) {
        const year: IYear = Session.account.year[i];
        labels.push(year.number.toString());
        let value: number = 0;
        let months = Object.keys(year.months);
        for (let k = 0; k < months.length; k++) {
            // @ts-ignore
            for (let j = 0; j < year.months[months[k]].length; j++) {
                // @ts-ignore
                value += year.months[months[k]][j];
            }
        }

        data.push(value);
    }

    yearStat.data.datasets[0].data = data.reverse();
    yearStat.data.labels = labels.reverse();
    yearStat.update();


    const list: HTMLElement = <HTMLElement>document.getElementById("yearList");
    list.innerHTML = "";

    if (Session.account.year.length === 0) {
        let li: HTMLLIElement = document.createElement("li");
        li.classList.add("list-group-item");
        li.addEventListener("click", () => {
            openYearPanel();
        });

        let span: HTMLSpanElement = document.createElement("span");
        span.innerHTML = "Add Year";

        li.appendChild(span);
        list.appendChild(li);
    } else {
        for (let i = 0; i < Session.account.year.length; i++) {
            let li: HTMLLIElement = document.createElement("li");
            li.classList.add("list-group-item");
            li.setAttribute("year", Session.account.year[i].number.toString());
            li.addEventListener("click", function () {
                Session.yearNumber = parseInt(<string>this.getAttribute("year"));
                loadInformationUi();
            });

            let span: HTMLSpanElement = document.createElement("span");
            span.innerHTML = Session.account.year[i].number.toString();

            li.appendChild(span);
            list.appendChild(li);
        }
    }
}

function loadInformationUi(): void {
    // TODO add animation
    (<HTMLElement>document.getElementById("yearsUi")).style.setProperty("display", "none", "important");

    loadInformationUiData();

    (<HTMLElement>document.getElementById("informationUi")).style.display = "";
    uiTarget = "informationUi";
}

function resize(): void {
    (<HTMLElement>document.getElementById("background")).style.height = window.innerHeight + "px";

    (<HTMLElement>document.querySelector(":root")).style.setProperty("--editPanel-maximize-tableWrapper-height", (window.innerHeight - 150).toString() + "px");
}

function closeEditPanel(): void {
    // TODO add animation
    (<HTMLElement>document.getElementById("editPanel")).style.setProperty("display", "none", "important");
    uiTarget = "informationUi";
}

function openEditPanel(): void {
    // TODO add animation

    loadEditPanelData();
    (<HTMLElement>document.getElementById("editPanel")).style.display = "";
    uiTarget = "editPanel";
}

function loadEditPanelData(): void {
    let year: IYear = <IYear>AccountList.getYear(Session.account, Session.yearNumber);
    let keys: string[] = Object.keys(year.months);
    let table: HTMLElement = <HTMLElement>document.getElementById("editPanelTable");

    table.innerHTML = "";

    // @ts-ignore
    for (let i = 0; i < year.months[keys[0]].length; i++) {
        const tr: HTMLTableRowElement = document.createElement("tr");
        // @ts-ignore
        for (let k = 0; k < keys.length; k++) {
            const td: HTMLTableDataCellElement = document.createElement("td");
            // @ts-ignore
            td.innerHTML = year.months[keys[k]][i];
            td.addEventListener("dblclick", function () {
                let data: string = this.innerHTML;
                let key: string = <string>this.getAttribute("key");
                let place: number = parseInt(<string>this.getAttribute("place"));
                const input: HTMLInputElement = document.createElement("input");
                input.type = "number";
                input.addEventListener("keyup", (e) => {
                    if (e.key === "Enter") {
                        data = input.value;
                        this.innerHTML = data;
                        Session.account = AccountList.updateYearValue(Session.account, key, Session.yearNumber, place, parseInt(data));
                        loadInformationUiData();
                    }
                });

                this.innerHTML = "";
                this.appendChild(input);
                input.focus();
            });
            td.setAttribute("key", keys[k]);
            td.setAttribute("place", i.toString());
            tr.appendChild(td);
        }

        table.appendChild(tr);
    }

}

function editPanelAddRow(): void {
    Session.account = AccountList.addMonthRow(Session.account, Session.yearNumber);
    loadEditPanelData();
    loadInformationUiData();
}

function editPanelDeleteRow(): void {
    Session.account = AccountList.removeMonthRow(Session.account, Session.yearNumber);
    loadEditPanelData();
    loadInformationUiData();
}

function sizeEditPanel(): boolean {
    // TODO add animation
    const ele: HTMLElement = <HTMLElement>document.getElementById("editPanel")
    if (ele.classList.contains("maximize")) {
        ele.classList.remove("maximize");
        return false;
    } else {
        ele.classList.add("maximize");
        return true;
    }
}

function openYearPanel(): void {
    // TODO add animation
    (<HTMLElement>document.getElementById("yearPanel")).style.display = "";
    uiTarget = "yearPanel";
}

function closeYearPanel(): void {
    // TODO add animation
    (<HTMLElement>document.getElementById("yearPanel")).style.setProperty("display", "none", "important");
    uiTarget = "yearUi";
}


function openExportPanel(): void {
    // TODO add animation
    (<HTMLElement>document.getElementById("exportPanel")).style.display = "";
    uiTarget = "exportPanel";
}

function sizeExportPanel(): boolean {
    // TODO add animation
    const ele: HTMLElement = <HTMLElement>document.getElementById("exportPanel")
    if (ele.classList.contains("maximize")) {
        ele.classList.remove("maximize");
        return false;
    } else {
        ele.classList.add("maximize");
        return true;
    }
}

function closeExportPanel(): void {
    // TODO add animation
    (<HTMLElement>document.getElementById("exportPanel")).style.setProperty("display", "none", "important");
    uiTarget = "yearUi";
}

function openDeleteYearPanel(): void {
    // TODO add animation
    (<HTMLElement>document.getElementById("deleteYearPanel")).style.display = "";
    uiTarget = "deleteYearPanel";
}

function closeDeleteYearPanel(): void {
    // TODO add animation
    (<HTMLElement>document.getElementById("deleteYearPanel")).style.setProperty("display", "none", "important");
    uiTarget = "informationUi";
}

function closeSettingsPanel(): void {
    // TODO add animation
    (<HTMLElement>document.getElementById("settingsPanel")).style.setProperty("display", "none", "important");
    // @ts-ignore
    (<HTMLElement>document.getElementById("settingsPanelChangePswForm")).reset();
    // @ts-ignore
    (<HTMLElement>document.getElementById("settingsPanelDeleteAccForm")).reset();
    uiTarget = "yearUi";
}


function openSettingsPanel(): void {
    // TODO add animation

    loadSettingsData();
    (<HTMLElement>document.getElementById("settingsPanel")).style.display = "";
    uiTarget = "settingsPanel";
}

function sizeSettingsPanel(): boolean {
    // TODO add animation
    const ele: HTMLElement = <HTMLElement>document.getElementById("settingsPanel")
    if (ele.classList.contains("maximize")) {
        ele.classList.remove("maximize");
        return false;
    } else {
        ele.classList.add("maximize");
        return true;
    }
}

function loadSettingsData(): void {
    const acc: account = Session.account;

    (<HTMLElement>document.getElementById("settingsUsername")).innerHTML = acc.username.replace(acc.username.charAt(0), acc.username.charAt(0).toUpperCase());

    (<HTMLElement>document.getElementById("settingsDataTable")).innerHTML = `
<tbody id="settingsDataTable">
    <tr>
        <td>Name</td>
        <td>${acc.username.replace(acc.username[0], acc.username[0].toUpperCase())}</td>
    </tr>
    <tr>
        <td>Password</td>
        <td>****</td>
    </tr>
    <tr>
        <td>Years</td>
        <td>${acc.year.length}</td>
    </tr>
</tbody>`

}

window.addEventListener("load", () => {
    // @ts-ignore
    yearStat = new Chart((<HTMLElement>document.getElementById('yearStat')).getContext('2d'), {
        type: "line",
        options: {
            plugins: {
                legend: {
                    display: false
                }
            },
            maintainAspectRatio: true
        },
        data: {
            labels: [],
            datasets: [
                {
                    data: [],
                    borderColor: "#007bff",
                    fill: false,
                    tension: 0.4
                }
            ]
        }
    });
    // @ts-ignore
    monthStat = new Chart((<HTMLElement>document.getElementById('monthStat')).getContext('2d'), {
        type: "line",
        options: {
            plugins: {
                legend: {
                    display: false
                }
            },
            maintainAspectRatio: true
        },
        data: {
            labels: [],
            datasets: [
                {
                    data: [],
                    borderColor: "#007bff",
                    fill: false,
                    tension: 0.4
                }
            ]
        }
    });

    window.addEventListener("resize", resize);
    window.addEventListener("keyup", (e) => {
        if (e.code === "Escape") {
            switch (uiTarget) {
                case "yearPanel":
                    closeYearPanel();
                    // @ts-ignore
                    (<HTMLElement>document.getElementById("yearPanelForm")).reset();
                    break;
                case "editPanel":
                    closeEditPanel();
                    break;
                case "exportPanel":
                    closeExportPanel();
                    break;
                case "deleteYearPanel":
                    closeDeleteYearPanel();
                    break;
                case "settingsPanel":
                    closeSettingsPanel();
                    break;
                case "informationUi":
                    loadYearUi();
                    break;
            }
        } else if (e.altKey && e.code === "Enter") {
            const win: BrowserWindow = remote.getCurrentWindow();
            const storage: LocalStorage = new LocalStorage();
            win.setFullScreen(!win.isFullScreen());

            storage.setItem("fullscreen", String(win.isFullScreen()));
        }
    });

    document.getElementById("homeViewLogout")?.addEventListener("click", logout);

    document.getElementById("loginViewChanger")?.addEventListener("click", () => {
        (<HTMLElement>document.getElementById("loginView")).style.setProperty("display", "none", "important");
        (<HTMLElement>document.getElementById("newView")).style.display = "flex";
    });

    document.getElementById("loginViewForm")?.addEventListener("submit", (e) => {
        e.preventDefault();

        // @ts-ignore
        const username: string = document.forms["loginViewForm"]["username"].value;
        // @ts-ignore
        const password: string = document.forms["loginViewForm"]["password"].value;
        // @ts-ignore
        const output: HTMLElement = document.forms["loginViewForm"]["output"];

        output.innerHTML = "";

        let acc: account | false = AccountList.login(username, password);

        if (acc) {
            Session.account = acc;
            loadHome();
        } else {
            output.innerHTML = "Sorry your username or password is wrong";
        }

        // @ts-ignore
        document.getElementById("loginViewForm")?.reset();
    });

    document.getElementById("newViewChanger")?.addEventListener("click", () => {
        (<HTMLElement>document.getElementById("newView")).style.setProperty("display", "none", "important");
        (<HTMLElement>document.getElementById("loginView")).style.display = "flex";
    });

    document.getElementById("newViewForm")?.addEventListener("submit", (e) => {
        e.preventDefault();

        // @ts-ignore
        const username: string = document.forms["newViewForm"]["username"].value;
        // @ts-ignore
        const password: string = document.forms["newViewForm"]["password"].value;
        // @ts-ignore
        const output: HTMLElement = document.forms["newViewForm"]["output"];

        output.innerHTML = "";

        if (!AccountList.exists(username)) {
            AccountList.create(username, password);
            Session.account = <account>AccountList.login(username, password);
            loadHome();
        } else {
            output.innerHTML = "Account already exists";
        }

        // @ts-ignore
        document.getElementById("newViewForm")?.reset();
    });

    document.getElementById("closeInformationUi")?.addEventListener("click", loadYearUi);

    document.getElementById("openEditPanel")?.addEventListener("click", openEditPanel);
    document.getElementById("closeEditPanel")?.addEventListener("click", closeEditPanel);
    document.getElementById("sizeEditPanel")?.addEventListener("click", () => {
        if (sizeEditPanel()) {
            (<HTMLElement>document.getElementById("sizeEditPanel")).innerHTML = "Minimize";
        } else {
            (<HTMLElement>document.getElementById("sizeEditPanel")).innerHTML = "Maximize";
        }
    });
    document.getElementById("editPanelAddRow")?.addEventListener("click", editPanelAddRow);
    document.getElementById("editPanelDeleteRow")?.addEventListener("click", editPanelDeleteRow);

    document.getElementById("openYearPanel")?.addEventListener("click", openYearPanel);
    document.getElementById("closeYearPanel")?.addEventListener("click", closeYearPanel);
    document.getElementById("yearPanelForm")?.addEventListener("submit", (e) => {
        e.preventDefault();

        // @ts-ignore
        const date: number = parseInt(document.forms["yearPanelForm"]["year"].value);
        // @ts-ignore
        const output: HTMLElement = document.forms["yearPanelForm"]["output"];

        output.innerHTML = "";

        if (isNaN(date)) {
            output.innerHTML = "Your input is not a year number";
        } else {
            if (AccountList.yearExists(Session.account, date)) {
                output.innerHTML = "Year already exist";
            } else {
                Session.account.year.push({
                    number: date,
                    months: {
                        jan: [0],
                        feb: [0],
                        mar: [0],
                        apr: [0],
                        may: [0],
                        jun: [0],
                        jul: [0],
                        aug: [0],
                        sep: [0],
                        oct: [0],
                        nov: [0],
                        dec: [0]
                    }
                });

                AccountList.update(Session.account);
                loadYearUiData();
                closeYearPanel();
            }
        }

        // @ts-ignore
        document.getElementById("yearPanelForm")?.reset();
    });

    document.getElementById("openExportPanel")?.addEventListener("click", openExportPanel);
    document.getElementById("closeExportPanel")?.addEventListener("click", () => {
        closeExportPanel();
        // @ts-ignore
        document.getElementById("exportPanelForm")?.reset();
    });
    document.getElementById("sizeExportPanel")?.addEventListener("click", () => {
        if (sizeExportPanel()) {
            (<HTMLElement>document.getElementById("sizeExportPanel")).innerHTML = "Minimize";
        } else {
            (<HTMLElement>document.getElementById("sizeExportPanel")).innerHTML = "Maximize";
        }
    })

    document.getElementById("exportPanelFormSelectFileBTN")?.addEventListener("click", () => {
        const fsWin: string = <string>dialog.showSaveDialogSync(remote.getCurrentWindow(), {
            properties: ["showOverwriteConfirmation"],
            filters: [
                {
                    name: "CSV",
                    extensions: ["csv"]
                }
            ]
        });

        if (fsWin) {
            // @ts-ignore
            document.forms["exportPanelForm"]["file"].value = fsWin;
        }
    });

    document.getElementById("exportPanelForm")?.addEventListener("submit", (e) => {
        e.preventDefault();

        // @ts-ignore
        let form = document.forms["exportPanelForm"];

        let path: string = form["file"].value;
        let type: string = form["type"].value;
        let output: HTMLElement = form["output"];


        output.innerHTML = "";

        if (path === "") {
            output.innerHTML = "Please select a output";
        } else {
            let acc: account = Session.account;

            if (type === "csv") {
                let data: string = "";

                for (let i = 0; i < acc.year.length; i++) {
                    let keys = Object.keys(acc.year[i].months);
                    let year: IYear = acc.year[i];

                    data += `Year: ${year.number};\n`;
                    for (let k = 0; k < keys.length; k++) {
                        data += keys[k].replace(keys[k][0], keys[k][0].toUpperCase()) + ";";
                    }
                    data += "\n";

                    // @ts-ignore
                    for (let j = 0; j < year.months[keys[0]].length; j++) {
                        // @ts-ignore
                        for (let k = 0; k < keys.length; k++) {
                            // @ts-ignore
                            data += year.months[keys[k]][j] + ";";
                        }
                        data += "\n";
                    }
                    data += "\n";

                    let completedValue: number = 0;

                    for (let j = 0; j < keys.length; j++) {
                        let value: number = 0;

                        // @ts-ignore
                        for (let k = 0; k < year.months[keys[j]].length; k++) {
                            // @ts-ignore
                            value += year.months[keys[j]][k];
                        }

                        data += value + ";";
                        completedValue += value;
                    }

                    data += "\n";
                    data += completedValue + ";\n";


                    data += "\n\n";
                }

                fs.writeFileSync(path, data);
                output.innerHTML = "Data successfully exported";
            }
        }

        // @ts-ignore
        document.getElementById("exportPanelForm")?.reset()
    });

    document.getElementById("openDeleteYearPanel")?.addEventListener("click", openDeleteYearPanel);
    document.getElementById("deleteYearPanelYes")?.addEventListener("click", () => {
        Session.account = AccountList.removeYear(Session.account, Session.yearNumber);
        closeDeleteYearPanel();
        loadYearUi();
    });
    document.getElementById("deleteYearPanelNo")?.addEventListener("click", () => {
        closeDeleteYearPanel();
    });

    document.getElementById("openSettingsPanel")?.addEventListener("click", openSettingsPanel);
    document.getElementById("closeSettingsPanel")?.addEventListener("click", closeSettingsPanel);
    document.getElementById("sizeSettingsPanel")?.addEventListener("click", () => {
        if (sizeSettingsPanel()) {
            (<HTMLElement>document.getElementById("sizeSettingsPanel")).innerHTML = "Minimize";
        } else {
            (<HTMLElement>document.getElementById("sizeSettingsPanel")).innerHTML = "Maximize";
        }
    });
    document.getElementById("settingsPanelChangePswForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        // @ts-ignore
        let form = document.forms["settingsPanelChangePswForm"];
        let oldPsw: string = form["oldPsw"].value;
        let newPsw: string = form["newPsw"].value;

        let output: HTMLElement = form["output"];

        output.innerHTML = "";

        if (compareSync(oldPsw, Session.account.password)) {
            Session.account = AccountList.changePassword(Session.account, newPsw);
            output.innerHTML = "Password successfully changed";
        } else {
            output.innerHTML = "Your Password is wrong";
        }

        // @ts-ignore
        document.getElementById("settingsPanelChangePswForm")?.reset();
    });
    document.getElementById("settingsPanelDeleteAccForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        // @ts-ignore
        let form = document.forms["settingsPanelDeleteAccForm"];
        let psw: string = form["psw"].value;

        let output: HTMLElement = form["output"];

        output.innerHTML = "";

        if (compareSync(psw, Session.account.password)) {
            AccountList.deleteAccount(Session.account);
            closeSettingsPanel();
            logout();
        } else {
            output.innerHTML = "Your Password is wrong";
        }

        // @ts-ignore
        document.getElementById("settingsPanelDeleteAccForm")?.reset();
    });

    resize();
})
;
