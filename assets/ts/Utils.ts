export const Array = {
    removeLastEntry: (arr: any[]): any[] => {
        let newArr: any[] = [];

        for (let i = 0; i < arr.length; i++) {
            if (i !== arr.length -1) {
                newArr.push(arr[i]);
            }
        }

        return newArr;
    }
}
