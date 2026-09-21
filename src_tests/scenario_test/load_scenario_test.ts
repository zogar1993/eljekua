import {normalize_creature_override} from "scenario_test/scenario_creature_override";
import type {ScenarioTest, ScenarioTestFile} from "scenario_test/ScenarioTest";

export const load_scenario_test_file = (raw: unknown): ScenarioTestFile => {
    if (typeof raw !== "object" || raw === null)
        throw Error("scenario must be an object")

    const scenario = raw as Partial<ScenarioTestFile>

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
        level_setup: {
            battle_grid_size: scenario.level_setup.battle_grid_size,
            creatures: scenario.level_setup.creatures.map(normalize_creature_override),
        },
        steps: scenario.steps,
    }
}

export const load_scenario_test = ({raw, name}: { raw: unknown, name: string }): ScenarioTest => {
    if (typeof name !== "string" || name.length === 0)
        throw Error("scenario path must be a non-empty string")

    return {
        name,
        ...load_scenario_test_file(raw),
    }
}

export const parse_scenario_test_json = (json: string): ScenarioTest => {
    const raw = JSON.parse(json) as Partial<ScenarioTest>
    if (typeof raw.name !== "string" || raw.name.length === 0)
        throw Error("scenario path must be a non-empty string")

    return load_scenario_test({raw, name: raw.name})
}

export const serialize_scenario_test_json = (scenario: ScenarioTest): string => {
    return JSON.stringify(scenario, null, 2)
}

export const serialize_scenario_test_file_json = (scenario: ScenarioTest): string => {
    const {name: _name, ...file_contents} = scenario
    return JSON.stringify(file_contents, null, 2)
}
