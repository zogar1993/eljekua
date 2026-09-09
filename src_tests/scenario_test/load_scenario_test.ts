import type {ScenarioTest} from "scenario_test/ScenarioTest";
import {create_empty_level_setup} from "scenario_test/ScenarioTest";

export const load_scenario_test = (raw: unknown): ScenarioTest => {
    if (typeof raw !== "object" || raw === null)
        throw Error("scenario must be an object")

    const scenario = raw as Partial<ScenarioTest>

    if (typeof scenario.name !== "string" || scenario.name.length === 0)
        throw Error("scenario.name must be a non-empty string")

    if (!Array.isArray(scenario.steps))
        throw Error("scenario.steps must be an array")

    if (typeof scenario.level_setup !== "object" || scenario.level_setup === null)
        throw Error("scenario.level_setup is required")

    if (typeof scenario.level_setup.battle_grid_size !== "object" || scenario.level_setup.battle_grid_size === null)
        throw Error("scenario.level_setup.battle_grid_size is required")

    if (typeof scenario.level_setup.battle_grid_size.x !== "number" || typeof scenario.level_setup.battle_grid_size.y !== "number")
        throw Error("scenario.level_setup.battle_grid_size must have numeric x and y")

    if (!Array.isArray(scenario.level_setup.creatures))
        throw Error("scenario.level_setup.creatures must be an array")

    return {
        name: scenario.name,
        level_setup: {
            battle_grid_size: scenario.level_setup.battle_grid_size,
            creatures: scenario.level_setup.creatures,
        },
        steps: scenario.steps,
    }
}

export const parse_scenario_test_json = (json: string): ScenarioTest => {
    return load_scenario_test(JSON.parse(json))
}

export const serialize_scenario_test_json = (scenario: ScenarioTest): string => {
    return JSON.stringify(scenario, null, 2)
}

export const create_empty_scenario_snapshot = (): ScenarioTest => ({
    name: "untitled_scenario",
    level_setup: create_empty_level_setup(),
    steps: [],
})
