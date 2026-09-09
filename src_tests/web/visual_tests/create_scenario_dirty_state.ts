import {serialize_scenario_test_json} from "scenario_test/load_scenario_test";
import type {ScenarioTest} from "scenario_test/ScenarioTest";

const create_empty_scenario_snapshot = (): ScenarioTest => ({
    name: "untitled_scenario",
    battle_grid_size: {x: 10, y: 10},
    steps: [],
})

export const create_scenario_dirty_state = () => {
    let saved_snapshot = serialize_scenario_test_json(create_empty_scenario_snapshot())

    return {
        mark_clean: (scenario: ScenarioTest) => {
            saved_snapshot = serialize_scenario_test_json(scenario)
        },
        is_dirty: (scenario: ScenarioTest) =>
            serialize_scenario_test_json(scenario) !== saved_snapshot,
    }
}
