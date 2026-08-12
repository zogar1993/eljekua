import {AssertionError} from "stdlib/AssertionError";

export function assert(value: boolean, message: () => string) {
    if(!value) throw Error(message())
}

export function assert_is_true(value: boolean) {
    if (!value) throw new AssertionError("Expected true")
}

export function assert_is_not_null<T>(value: T | null): asserts value is T {
    if (value == null) throw new AssertionError("Expected not null")
}