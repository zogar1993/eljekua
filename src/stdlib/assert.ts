import {AssertionError} from "stdlib/AssertionError";

export function assert(value: boolean, message: () => string) {
    if (!value) throw new AssertionError(message())
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
    if (index < 0 || index >= array.length) throw new AssertionError(`Index ${index} is out of bounds for array of length ${array.length}`)
}

export function assert_is_included<T>(item: T, array: Array<T>) {
    if (!array.includes(item)) throw new AssertionError(`Item not included in array.\n Item: ${to_json(item)}\n Array: ${to_json(array)}`)
}

export function assert_is_not_included<T>(item: T, array: Array<T>) {
    if (array.includes(item)) throw new AssertionError(`Item included in array.\n Item: ${to_json(item)}\n Array: ${to_json(array)}`)
}

export function assert_is_not_empty<T>(array: Array<T>) {
    if (array.length === 0) throw new AssertionError(`Expected array to not be empty.`)
}

export function assert_has_length_one<T>(array: Array<T>): asserts array is [T] {
    if (array.length !== 1) throw new AssertionError(`Expected array to have length 1, got ${array.length}`)
}

export function assert_are_equal<T = number | string>(a: T, b: T) {
    if (a !== b) throw new AssertionError(`Expected ${to_json(a)} to equal ${to_json(b)}.`)
}

export function assert_are_not_equal<T = number | string>(a: T, b: T) {
    if (a === b) throw new AssertionError(`Expected '${to_json(a)}' to not equal '${to_json(b)}'.`)
}

export function assert_is_lower_than(a: number, b: number) {
    if (a >= b) throw new AssertionError(`Expected ${a} to be lower than ${b}.`)
}

export function assert_is_not_negative(value: number) {
    if (value < 0) throw new AssertionError(`Expected non-negative number, got ${value}`)
}

export function assert_is_type<T extends { type: string }, U extends T["type"]>(
    value: T,
    type: U,
): asserts value is Extract<T, { type: U }> {
    if (value.type !== type) throw new AssertionError(`Expected type '${type}', got '${value.type}'`)
}

export function assert_unreachable(message: string): never {
    throw new AssertionError(message)
}

const to_json = (value: unknown) => JSON.stringify(value, null, 2)
