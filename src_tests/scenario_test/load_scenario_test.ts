import type {ScenarioTest} from "scenario_test/ScenarioTest";

export const load_scenario_test = (raw: unknown): ScenarioTest => {
    if (typeof raw !== "object" || raw === null)
        throw Error("scenario must be an object")

    const scenario = raw as Partial<ScenarioTest>

    if (typeof scenario.name !== "string" || scenario.name.length === 0)
        throw Error("scenario.name must be a non-empty string")

    if (typeof scenario.battle_grid_size !== "object" || scenario.battle_grid_size === null)
        throw Error("scenario.battle_grid_size is required")

    if (typeof scenario.battle_grid_size.x !== "number" || typeof scenario.battle_grid_size.y !== "number")
        throw Error("scenario.battle_grid_size must have numeric x and y")

    if (!Array.isArray(scenario.steps))
        throw Error("scenario.steps must be an array")

    return {
        name: scenario.name,
        battle_grid_size: scenario.battle_grid_size,
        steps: scenario.steps,
    }
}

export const parse_scenario_test_json = (json: string): ScenarioTest => {
    return load_scenario_test(JSON.parse(json))
}

export const serialize_scenario_test_json = (scenario: ScenarioTest): string => {
    return JSON.stringify(scenario, null, 2)
}
