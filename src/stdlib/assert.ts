export function assert(value: boolean, message: () => string) {
    if(!value) throw Error(message())
}
