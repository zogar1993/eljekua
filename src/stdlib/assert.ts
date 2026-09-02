import {AssertionError} from "stdlib/AssertionError";

export function assert(value: boolean, message: () => string) {
    if (!value) throw Error(message())
}

export function assert_is_true(value: boolean) {
    if (!value) throw new AssertionError("Expected true")
}

export function assert_is_not_null<T>(value: T | null): asserts value is T {
    if (value === null) throw new AssertionError("Expected not null")
}

export function assert_is_not_undefined<T>(value: T | undefined): asserts value is T {
    if (value === undefined) throw new AssertionError(`Expected not undefined`)
}

export function assert_is_valid_index(index: number, array: Array<unknown>) {
    if (index < 0 || index >= array.length) throw Error(`Index ${index} is out of bounds for array of length ${array.length}`)
}

export function assert_is_included<T>(item: T, array: Array<T>) {
    if (!array.includes(item)) throw Error(`Item not included in array.\n Item: ${to_json(item)}\n Array: ${to_json(array)}`)
}

const to_json = (value: unknown) => JSON.stringify(value, null, 2)