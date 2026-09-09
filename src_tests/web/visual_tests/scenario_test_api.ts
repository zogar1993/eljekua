import {parse_scenario_test_json, serialize_scenario_test_json} from "scenario_test/load_scenario_test";
import type {ScenarioTest} from "scenario_test/ScenarioTest";

export const SCENARIO_TEST_API_BASE = ""

export const sanitize_scenario_filename = (name: string) => {
    const sanitized = name.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_|_$/g, "")
    return sanitized.length > 0 ? sanitized : "untitled_scenario"
}

export const list_scenario_tests = async (): Promise<Array<string>> => {
    const response = await fetch(`${SCENARIO_TEST_API_BASE}/api/scenarios`)
    if (!response.ok)
        throw Error(`failed to list scenarios (${response.status})`)
    const body = await response.json() as { scenarios: Array<string> }
    return body.scenarios
}

export const load_scenario_test_by_name = async (name: string): Promise<ScenarioTest> => {
    const response = await fetch(`${SCENARIO_TEST_API_BASE}/api/scenarios/${encodeURIComponent(name)}`)
    if (!response.ok)
        throw Error(`failed to load scenario "${name}" (${response.status})`)
    return parse_scenario_test_json(await response.text())
}

export const save_scenario_test = async (scenario: ScenarioTest): Promise<string> => {
    const filename = sanitize_scenario_filename(scenario.name)
    const response = await fetch(`${SCENARIO_TEST_API_BASE}/api/scenarios/${encodeURIComponent(filename)}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: serialize_scenario_test_json({...scenario, name: filename}),
    })
    if (!response.ok)
        throw Error(`failed to save scenario (${response.status})`)
    const body = await response.json() as { saved: string }
    return body.saved
}
