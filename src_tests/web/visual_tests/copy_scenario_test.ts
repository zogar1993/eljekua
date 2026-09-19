import {get_test_folder_path} from "scenario_test/get_test_folder_path";
import type {ScenarioTest} from "scenario_test/ScenarioTest";
import {sanitize_scenario_path} from "scenario_test/sanitize_scenario_path";
import {list_scenario_tests, save_scenario_test} from "web/visual_tests/scenario_test_api";
import {load_test_powers_by_path, save_test_powers_by_path} from "web/visual_tests/test_powers_api";

export const copy_scenario_test = async ({
                                             source_path,
                                             target_path,
                                             scenario,
                                         }: {
    source_path: string
    target_path: string
    scenario: ScenarioTest
}): Promise<string> => {
    const sanitized_target = sanitize_scenario_path(target_path)
    const existing_paths = await list_scenario_tests()
    if (existing_paths.includes(sanitized_target))
        throw Error(`A test named "${sanitized_target}" already exists.`)

    const saved = await save_scenario_test({...scenario, name: sanitized_target})

    const source_folder = get_test_folder_path(source_path)
    const target_folder = get_test_folder_path(sanitized_target)
    if (source_folder !== target_folder) {
        const powers = await load_test_powers_by_path(source_path)
        if (powers.powers.length > 0)
            await save_test_powers_by_path({test_path: sanitized_target, file: powers})
    }

    return saved
}
