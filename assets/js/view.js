"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chart_js_1 = require("chart.js");
const AccountList_1 = require("./AccountList");
const Session_1 = require("./Session");
const electron_1 = require("electron");
const bcrypt_1 = require("bcrypt");
const LocalStorage_1 = require("./LocalStorage");
const fs = require("fs");
const dialog = electron_1.remote.dialog;
let yearStat;
let monthStat;
let uiTarget;
function logout() {
    Session_1.Session.account = {
        password: "",
        year: [],
        username: ""
    };
    Session_1.Session.yearNumber = 0;
    loadLogin();
}
function loadHome() {
    document.getElementById("informationUi").style.display = "none";
    document.getElementById("yearsUi").style.display = "";
    loadYearUiData();
    document.getElementById("loginView").style.setProperty("display", "none", "important");
    document.getElementById("newView").style.setProperty("display", "none", "important");
    document.getElementById("homeView").style.display = "";
}
function loadLogin() {
    document.getElementById("informationUi").style.display = "none";
    document.getElementById("yearsUi").style.display = "none";
    document.getElementById("newView").style.setProperty("display", "none", "important");
    document.getElementById("homeView").style.setProperty("display", "none", "important");
    document.getElementById("loginView").style.display = "";
}
function loadInformationUiData() {
    const year = AccountList_1.AccountList.getYear(Session_1.Session.account, Session_1.Session.yearNumber);
    const data = [];
    const labels = Object.keys(year.months);
    for (let i = 0; i < labels.length; i++) {
        let value = 0;
        for (let k = 0; k < year.months[labels[i]].length; k++) {
            value += year.months[labels[i]][k];
        }
        data.push(value);
        labels[i] = labels[i].replace(labels[i][0], labels[i][0].toUpperCase());
    }
    monthStat.data.labels = labels;
    monthStat.data.datasets[0].data = data;
    monthStat.update();
    const keys = Object.keys(year.months);
    const tableBody = document.getElementById("informationUiDataTableBody");
    const tableFooter = document.getElementById("informationUiDataTableFooter");
    tableBody.innerHTML = "";
    for (let i = 0; i < year.months.jan.length; i++) {
        const tr = document.createElement("tr");
        for (let k = 0; k < keys.length; k++) {
            const td = document.createElement("td");
            td.innerHTML = year.months[keys[k]][i].toString();
            tr.appendChild(td);
        }
        tableBody.appendChild(tr);
    }
    tableFooter.innerHTML = "";
    let completeValue = 0;
    let tr = document.createElement("tr");
    for (let i = 0; i < data.length; i++) {
        const td = document.createElement("td");
        td.innerHTML = data[i].toString();
        tr.appendChild(td);
        completeValue += data[i];
    }
    tableFooter.appendChild(tr);
    tr = document.createElement("tr");
    let td = document.createElement("td");
    td.innerHTML = completeValue.toString();
    td.colSpan = 12;
    tr.appendChild(td);
    tableFooter.appendChild(tr);
}
function loadYearUi() {
    document.getElementById("informationUi").style.setProperty("display", "none", "important");
    loadYearUiData();
    document.getElementById("yearsUi").style.display = "";
    uiTarget = "yearUi";
}
function loadYearUiData() {
    const labels = [];
    const data = [];
    Session_1.Session.account.year.sort((a, b) => {
        if (a.number < b.number) {
            return 1;
        }
        else if (a.number > b.number) {
            return -1;
        }
        else {
            return 0;
        }
    });
    for (let i = 0; i < Session_1.Session.account.year.length; i++) {
        const year = Session_1.Session.account.year[i];
        labels.push(year.number.toString());
        let value = 0;
        let months = Object.keys(year.months);
        for (let k = 0; k < months.length; k++) {
            for (let j = 0; j < year.months[months[k]].length; j++) {
                value += year.months[months[k]][j];
            }
        }
        data.push(value);
    }
    yearStat.data.datasets[0].data = data.reverse();
    yearStat.data.labels = labels.reverse();
    yearStat.update();
    const list = document.getElementById("yearList");
    list.innerHTML = "";
    if (Session_1.Session.account.year.length === 0) {
        let li = document.createElement("li");
        li.classList.add("list-group-item");
        li.addEventListener("click", () => {
            openYearPanel();
        });
        let span = document.createElement("span");
        span.innerHTML = "Add Year";
        li.appendChild(span);
        list.appendChild(li);
    }
    else {
        for (let i = 0; i < Session_1.Session.account.year.length; i++) {
            let li = document.createElement("li");
            li.classList.add("list-group-item");
            li.setAttribute("year", Session_1.Session.account.year[i].number.toString());
            li.addEventListener("click", function () {
                Session_1.Session.yearNumber = parseInt(this.getAttribute("year"));
                loadInformationUi();
            });
            let span = document.createElement("span");
            span.innerHTML = Session_1.Session.account.year[i].number.toString();
            li.appendChild(span);
            list.appendChild(li);
        }
    }
}
function loadInformationUi() {
    document.getElementById("yearsUi").style.setProperty("display", "none", "important");
    loadInformationUiData();
    document.getElementById("informationUi").style.display = "";
    uiTarget = "informationUi";
}
function resize() {
    document.getElementById("background").style.height = window.innerHeight + "px";
    document.querySelector(":root").style.setProperty("--editPanel-maximize-tableWrapper-height", (window.innerHeight - 150).toString() + "px");
}
function closeEditPanel() {
    document.getElementById("editPanel").style.setProperty("display", "none", "important");
    uiTarget = "informationUi";
}
function openEditPanel() {
    loadEditPanelData();
    document.getElementById("editPanel").style.display = "";
    uiTarget = "editPanel";
}
function loadEditPanelData() {
    let year = AccountList_1.AccountList.getYear(Session_1.Session.account, Session_1.Session.yearNumber);
    let keys = Object.keys(year.months);
    let table = document.getElementById("editPanelTable");
    table.innerHTML = "";
    for (let i = 0; i < year.months[keys[0]].length; i++) {
        const tr = document.createElement("tr");
        for (let k = 0; k < keys.length; k++) {
            const td = document.createElement("td");
            td.innerHTML = year.months[keys[k]][i];
            td.addEventListener("dblclick", function () {
                let data = this.innerHTML;
                let key = this.getAttribute("key");
                let place = parseInt(this.getAttribute("place"));
                const input = document.createElement("input");
                input.type = "number";
                input.addEventListener("keyup", (e) => {
                    if (e.key === "Enter") {
                        data = input.value;
                        this.innerHTML = data;
                        Session_1.Session.account = AccountList_1.AccountList.updateYearValue(Session_1.Session.account, key, Session_1.Session.yearNumber, place, parseInt(data));
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
function editPanelAddRow() {
    Session_1.Session.account = AccountList_1.AccountList.addMonthRow(Session_1.Session.account, Session_1.Session.yearNumber);
    loadEditPanelData();
    loadInformationUiData();
}
function editPanelDeleteRow() {
    Session_1.Session.account = AccountList_1.AccountList.removeMonthRow(Session_1.Session.account, Session_1.Session.yearNumber);
    loadEditPanelData();
    loadInformationUiData();
}
function sizeEditPanel() {
    const ele = document.getElementById("editPanel");
    if (ele.classList.contains("maximize")) {
        ele.classList.remove("maximize");
        return false;
    }
    else {
        ele.classList.add("maximize");
        return true;
    }
}
function openYearPanel() {
    document.getElementById("yearPanel").style.display = "";
    uiTarget = "yearPanel";
}
function closeYearPanel() {
    document.getElementById("yearPanel").style.setProperty("display", "none", "important");
    uiTarget = "yearUi";
}
function openExportPanel() {
    document.getElementById("exportPanel").style.display = "";
    uiTarget = "exportPanel";
}
function sizeExportPanel() {
    const ele = document.getElementById("exportPanel");
    if (ele.classList.contains("maximize")) {
        ele.classList.remove("maximize");
        return false;
    }
    else {
        ele.classList.add("maximize");
        return true;
    }
}
function closeExportPanel() {
    document.getElementById("exportPanel").style.setProperty("display", "none", "important");
    uiTarget = "yearUi";
}
function openDeleteYearPanel() {
    document.getElementById("deleteYearPanel").style.display = "";
    uiTarget = "deleteYearPanel";
}
function closeDeleteYearPanel() {
    document.getElementById("deleteYearPanel").style.setProperty("display", "none", "important");
    uiTarget = "informationUi";
}
function closeSettingsPanel() {
    document.getElementById("settingsPanel").style.setProperty("display", "none", "important");
    document.getElementById("settingsPanelChangePswForm").reset();
    document.getElementById("settingsPanelDeleteAccForm").reset();
    uiTarget = "yearUi";
}
function openSettingsPanel() {
    loadSettingsData();
    document.getElementById("settingsPanel").style.display = "";
    uiTarget = "settingsPanel";
}
function sizeSettingsPanel() {
    const ele = document.getElementById("settingsPanel");
    if (ele.classList.contains("maximize")) {
        ele.classList.remove("maximize");
        return false;
    }
    else {
        ele.classList.add("maximize");
        return true;
    }
}
function loadSettingsData() {
    const acc = Session_1.Session.account;
    document.getElementById("settingsUsername").innerHTML = acc.username.replace(acc.username.charAt(0), acc.username.charAt(0).toUpperCase());
    document.getElementById("settingsDataTable").innerHTML = `
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
</tbody>`;
}
window.addEventListener("load", () => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2;
    yearStat = new chart_js_1.Chart(document.getElementById('yearStat').getContext('2d'), {
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
    monthStat = new chart_js_1.Chart(document.getElementById('monthStat').getContext('2d'), {
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
                    document.getElementById("yearPanelForm").reset();
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
        }
        else if (e.altKey && e.code === "Enter") {
            const win = electron_1.remote.getCurrentWindow();
            const storage = new LocalStorage_1.LocalStorage();
            win.setFullScreen(!win.isFullScreen());
            storage.setItem("fullscreen", String(win.isFullScreen()));
        }
    });
    (_a = document.getElementById("homeViewLogout")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", logout);
    (_b = document.getElementById("loginViewChanger")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        document.getElementById("loginView").style.setProperty("display", "none", "important");
        document.getElementById("newView").style.display = "flex";
    });
    (_c = document.getElementById("loginViewForm")) === null || _c === void 0 ? void 0 : _c.addEventListener("submit", (e) => {
        var _a;
        e.preventDefault();
        const username = document.forms["loginViewForm"]["username"].value;
        const password = document.forms["loginViewForm"]["password"].value;
        const output = document.forms["loginViewForm"]["output"];
        output.innerHTML = "";
        let acc = AccountList_1.AccountList.login(username, password);
        if (acc) {
            Session_1.Session.account = acc;
            loadHome();
        }
        else {
            output.innerHTML = "Sorry your username or password is wrong";
        }
        (_a = document.getElementById("loginViewForm")) === null || _a === void 0 ? void 0 : _a.reset();
    });
    (_d = document.getElementById("newViewChanger")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
        document.getElementById("newView").style.setProperty("display", "none", "important");
        document.getElementById("loginView").style.display = "flex";
    });
    (_e = document.getElementById("newViewForm")) === null || _e === void 0 ? void 0 : _e.addEventListener("submit", (e) => {
        var _a;
        e.preventDefault();
        const username = document.forms["newViewForm"]["username"].value;
        const password = document.forms["newViewForm"]["password"].value;
        const output = document.forms["newViewForm"]["output"];
        output.innerHTML = "";
        if (!AccountList_1.AccountList.exists(username)) {
            AccountList_1.AccountList.create(username, password);
            Session_1.Session.account = AccountList_1.AccountList.login(username, password);
            loadHome();
        }
        else {
            output.innerHTML = "Account already exists";
        }
        (_a = document.getElementById("newViewForm")) === null || _a === void 0 ? void 0 : _a.reset();
    });
    (_f = document.getElementById("closeInformationUi")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", loadYearUi);
    (_g = document.getElementById("openEditPanel")) === null || _g === void 0 ? void 0 : _g.addEventListener("click", openEditPanel);
    (_h = document.getElementById("closeEditPanel")) === null || _h === void 0 ? void 0 : _h.addEventListener("click", closeEditPanel);
    (_j = document.getElementById("sizeEditPanel")) === null || _j === void 0 ? void 0 : _j.addEventListener("click", () => {
        if (sizeEditPanel()) {
            document.getElementById("sizeEditPanel").innerHTML = "Minimize";
        }
        else {
            document.getElementById("sizeEditPanel").innerHTML = "Maximize";
        }
    });
    (_k = document.getElementById("editPanelAddRow")) === null || _k === void 0 ? void 0 : _k.addEventListener("click", editPanelAddRow);
    (_l = document.getElementById("editPanelDeleteRow")) === null || _l === void 0 ? void 0 : _l.addEventListener("click", editPanelDeleteRow);
    (_m = document.getElementById("openYearPanel")) === null || _m === void 0 ? void 0 : _m.addEventListener("click", openYearPanel);
    (_o = document.getElementById("closeYearPanel")) === null || _o === void 0 ? void 0 : _o.addEventListener("click", closeYearPanel);
    (_p = document.getElementById("yearPanelForm")) === null || _p === void 0 ? void 0 : _p.addEventListener("submit", (e) => {
        var _a;
        e.preventDefault();
        const date = parseInt(document.forms["yearPanelForm"]["year"].value);
        const output = document.forms["yearPanelForm"]["output"];
        output.innerHTML = "";
        if (isNaN(date)) {
            output.innerHTML = "Your input is not a year number";
        }
        else {
            if (AccountList_1.AccountList.yearExists(Session_1.Session.account, date)) {
                output.innerHTML = "Year already exist";
            }
            else {
                Session_1.Session.account.year.push({
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
                AccountList_1.AccountList.update(Session_1.Session.account);
                loadYearUiData();
                closeYearPanel();
            }
        }
        (_a = document.getElementById("yearPanelForm")) === null || _a === void 0 ? void 0 : _a.reset();
    });
    (_q = document.getElementById("openExportPanel")) === null || _q === void 0 ? void 0 : _q.addEventListener("click", openExportPanel);
    (_r = document.getElementById("closeExportPanel")) === null || _r === void 0 ? void 0 : _r.addEventListener("click", () => {
        var _a;
        closeExportPanel();
        (_a = document.getElementById("exportPanelForm")) === null || _a === void 0 ? void 0 : _a.reset();
    });
    (_s = document.getElementById("sizeExportPanel")) === null || _s === void 0 ? void 0 : _s.addEventListener("click", () => {
        if (sizeExportPanel()) {
            document.getElementById("sizeExportPanel").innerHTML = "Minimize";
        }
        else {
            document.getElementById("sizeExportPanel").innerHTML = "Maximize";
        }
    });
    (_t = document.getElementById("exportPanelFormSelectFileBTN")) === null || _t === void 0 ? void 0 : _t.addEventListener("click", () => {
        const fsWin = dialog.showSaveDialogSync(electron_1.remote.getCurrentWindow(), {
            properties: ["showOverwriteConfirmation"],
            filters: [
                {
                    name: "CSV",
                    extensions: ["csv"]
                }
            ]
        });
        if (fsWin) {
            document.forms["exportPanelForm"]["file"].value = fsWin;
        }
    });
    (_u = document.getElementById("exportPanelForm")) === null || _u === void 0 ? void 0 : _u.addEventListener("submit", (e) => {
        var _a;
        e.preventDefault();
        let form = document.forms["exportPanelForm"];
        let path = form["file"].value;
        let type = form["type"].value;
        let output = form["output"];
        output.innerHTML = "";
        if (path === "") {
            output.innerHTML = "Please select a output";
        }
        else {
            let acc = Session_1.Session.account;
            if (type === "csv") {
                let data = "";
                for (let i = 0; i < acc.year.length; i++) {
                    let keys = Object.keys(acc.year[i].months);
                    let year = acc.year[i];
                    data += `Year: ${year.number};\n`;
                    for (let k = 0; k < keys.length; k++) {
                        data += keys[k].replace(keys[k][0], keys[k][0].toUpperCase()) + ";";
                    }
                    data += "\n";
                    for (let j = 0; j < year.months[keys[0]].length; j++) {
                        for (let k = 0; k < keys.length; k++) {
                            data += year.months[keys[k]][j] + ";";
                        }
                        data += "\n";
                    }
                    data += "\n";
                    let completedValue = 0;
                    for (let j = 0; j < keys.length; j++) {
                        let value = 0;
                        for (let k = 0; k < year.months[keys[j]].length; k++) {
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
        (_a = document.getElementById("exportPanelForm")) === null || _a === void 0 ? void 0 : _a.reset();
    });
    (_v = document.getElementById("openDeleteYearPanel")) === null || _v === void 0 ? void 0 : _v.addEventListener("click", openDeleteYearPanel);
    (_w = document.getElementById("deleteYearPanelYes")) === null || _w === void 0 ? void 0 : _w.addEventListener("click", () => {
        Session_1.Session.account = AccountList_1.AccountList.removeYear(Session_1.Session.account, Session_1.Session.yearNumber);
        closeDeleteYearPanel();
        loadYearUi();
    });
    (_x = document.getElementById("deleteYearPanelNo")) === null || _x === void 0 ? void 0 : _x.addEventListener("click", () => {
        closeDeleteYearPanel();
    });
    (_y = document.getElementById("openSettingsPanel")) === null || _y === void 0 ? void 0 : _y.addEventListener("click", openSettingsPanel);
    (_z = document.getElementById("closeSettingsPanel")) === null || _z === void 0 ? void 0 : _z.addEventListener("click", closeSettingsPanel);
    (_0 = document.getElementById("sizeSettingsPanel")) === null || _0 === void 0 ? void 0 : _0.addEventListener("click", () => {
        if (sizeSettingsPanel()) {
            document.getElementById("sizeSettingsPanel").innerHTML = "Minimize";
        }
        else {
            document.getElementById("sizeSettingsPanel").innerHTML = "Maximize";
        }
    });
    (_1 = document.getElementById("settingsPanelChangePswForm")) === null || _1 === void 0 ? void 0 : _1.addEventListener("submit", (e) => {
        var _a;
        e.preventDefault();
        let form = document.forms["settingsPanelChangePswForm"];
        let oldPsw = form["oldPsw"].value;
        let newPsw = form["newPsw"].value;
        let output = form["output"];
        output.innerHTML = "";
        if (bcrypt_1.compareSync(oldPsw, Session_1.Session.account.password)) {
            Session_1.Session.account = AccountList_1.AccountList.changePassword(Session_1.Session.account, newPsw);
            output.innerHTML = "Password successfully changed";
        }
        else {
            output.innerHTML = "Your Password is wrong";
        }
        (_a = document.getElementById("settingsPanelChangePswForm")) === null || _a === void 0 ? void 0 : _a.reset();
    });
    (_2 = document.getElementById("settingsPanelDeleteAccForm")) === null || _2 === void 0 ? void 0 : _2.addEventListener("submit", (e) => {
        var _a;
        e.preventDefault();
        let form = document.forms["settingsPanelDeleteAccForm"];
        let psw = form["psw"].value;
        let output = form["output"];
        output.innerHTML = "";
        if (bcrypt_1.compareSync(psw, Session_1.Session.account.password)) {
            AccountList_1.AccountList.deleteAccount(Session_1.Session.account);
            closeSettingsPanel();
            logout();
        }
        else {
            output.innerHTML = "Your Password is wrong";
        }
        (_a = document.getElementById("settingsPanelDeleteAccForm")) === null || _a === void 0 ? void 0 : _a.reset();
    });
    resize();
});
//# sourceMappingURL=view.js.map