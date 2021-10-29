"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Array = void 0;
exports.Array = {
    removeLastEntry: (arr) => {
        let newArr = [];
        for (let i = 0; i < arr.length; i++) {
            if (i !== arr.length - 1) {
                newArr.push(arr[i]);
            }
        }
        return newArr;
    }
};
//# sourceMappingURL=Utils.js.map