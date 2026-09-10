import type {IRPower} from "core/types";

export type TestPowersFile = {
    powers: Array<IRPower>
}

export const load_test_powers = (raw: unknown): TestPowersFile => {
    if (typeof raw !== "object" || raw === null)
        throw Error("test powers must be an object")

    const file = raw as Partial<TestPowersFile>
    if (!Array.isArray(file.powers))
        throw Error("test powers.powers must be an array")

    return {powers: file.powers}
}

export const parse_test_powers_json = (json: string): TestPowersFile =>
    load_test_powers(JSON.parse(json))

export const serialize_test_powers_json = (file: TestPowersFile): string =>
    JSON.stringify(file, null, 2)

export const create_empty_test_powers = (): TestPowersFile => ({
    powers: [],
})
