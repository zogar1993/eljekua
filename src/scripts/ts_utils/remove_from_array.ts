export const remove_from_array = <T>(array: Array<T>, index: number): Array<T> =>
    [...array.slice(0, index), ...array.slice(index + 1)]