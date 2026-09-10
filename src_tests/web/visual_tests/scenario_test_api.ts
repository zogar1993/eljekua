import {parse_scenario_test_json, serialize_scenario_test_json} from "scenario_test/load_scenario_test";
import {sanitize_scenario_path, encode_scenario_path_for_url} from "scenario_test/sanitize_scenario_path";
import type {ScenarioTest} from "scenario_test/ScenarioTest";

export const SCENARIO_TEST_API_BASE = ""

export const list_scenario_tests = async (): Promise<Array<string>> => {
    const response = await fetch(`${SCENARIO_TEST_API_BASE}/api/scenarios`)
    if (!response.ok)
        throw Error(`failed to list scenarios (${response.status})`)
    const body = await response.json() as { scenarios: Array<string> }
    return body.scenarios
}

export const load_scenario_test_by_path = async (path: string): Promise<ScenarioTest> => {
    const scenario_path = sanitize_scenario_path(path)
    const response = await fetch(`${SCENARIO_TEST_API_BASE}/api/scenarios/${encode_scenario_path_for_url(path)}`)
    if (!response.ok)
        throw Error(`failed to load scenario "${scenario_path}" (${response.status})`)
    return parse_scenario_test_json(await response.text())
}

export const delete_scenario_test = async (path: string): Promise<void> => {
    const scenario_path = sanitize_scenario_path(path)
    const response = await fetch(`${SCENARIO_TEST_API_BASE}/api/scenarios/${encode_scenario_path_for_url(scenario_path)}`, {
        method: "DELETE",
    })
    if (!response.ok)
        throw Error(`failed to delete scenario "${scenario_path}" (${response.status})`)
}

export const save_scenario_test = async (scenario: ScenarioTest): Promise<string> => {
    const scenario_path = sanitize_scenario_path(scenario.name)
    const response = await fetch(`${SCENARIO_TEST_API_BASE}/api/scenarios/${encode_scenario_path_for_url(scenario_path)}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: serialize_scenario_test_json({...scenario, name: scenario_path}),
    })
    if (!response.ok)
        throw Error(`failed to save scenario (${response.status})`)
    const body = await response.json() as { saved: string }
    return body.saved
}
