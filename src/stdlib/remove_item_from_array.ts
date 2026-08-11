import {remove_from_array_by_index} from "stdlib/remove_from_array_by_index";

export const remove_item_from_array = <T>(array: Array<T>, item: T): Array<T> =>
    remove_from_array_by_index(array, array.indexOf(item))