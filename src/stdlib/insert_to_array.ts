export const insert_to_array = <T>(array: Array<T>, item: T, index: number) => {
    const arr = [...array]
    arr.splice(index, 0, item)
    return arr
}