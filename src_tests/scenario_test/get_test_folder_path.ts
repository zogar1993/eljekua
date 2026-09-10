import {sanitize_scenario_path} from "scenario_test/sanitize_scenario_path";

export const get_test_folder_path = (test_path: string): string => {
    const sanitized = sanitize_scenario_path(test_path)
    const last_slash = sanitized.lastIndexOf("/")
    return last_slash >= 0 ? sanitized.slice(0, last_slash) : ""
}

export const get_test_powers_relative_file = (test_path: string): string => {
    const folder = get_test_folder_path(test_path)
    return folder ? `${folder}/_powers.json` : "_powers.json"
}
