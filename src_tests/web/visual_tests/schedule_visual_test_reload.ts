import {parse_scenario_test_json, serialize_scenario_test_json} from "scenario_test/load_scenario_test";
import type {ScenarioTest} from "scenario_test/ScenarioTest";

export const VISUAL_TEST_RELOAD_STORAGE_KEY = "eljekua_visual_test_reload"

export const schedule_visual_test_reload = (scenario: ScenarioTest) => {
    sessionStorage.setItem(VISUAL_TEST_RELOAD_STORAGE_KEY, serialize_scenario_test_json(scenario))
    window.location.reload()
}

export const read_scheduled_visual_test_reload = (): ScenarioTest | null => {
    const raw = sessionStorage.getItem(VISUAL_TEST_RELOAD_STORAGE_KEY)
    if (!raw) return null
    sessionStorage.removeItem(VISUAL_TEST_RELOAD_STORAGE_KEY)
    return parse_scenario_test_json(raw)
}
