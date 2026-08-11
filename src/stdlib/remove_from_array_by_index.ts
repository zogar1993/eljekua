export const remove_from_array_by_index = <T>(array: Array<T>, index: number): Array<T> =>
    [...array.slice(0, index), ...array.slice(index + 1)]