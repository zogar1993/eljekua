export const initialize_matrix: <T>({}: { width: number, height: number, value: T }) => Array<Array<T>> =
    ({width, height, value}: { width: number, height: number, value: any }) =>
        Array.from({length: height}, () => Array.from({length: width}, () => value))