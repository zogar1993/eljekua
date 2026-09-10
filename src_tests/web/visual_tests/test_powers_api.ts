import {get_test_folder_path} from "scenario_test/get_test_folder_path";
import {
    create_empty_test_powers,
    parse_test_powers_json,
    serialize_test_powers_json,
    type TestPowersFile,
} from "scenario_test/load_test_powers";
import {encode_scenario_path_for_url} from "scenario_test/sanitize_scenario_path";
import {SCENARIO_TEST_API_BASE} from "web/visual_tests/scenario_test_api";

export const load_test_powers_by_path = async (test_path: string): Promise<TestPowersFile> => {
    const folder = get_test_folder_path(test_path)
    const encoded_folder = folder
        ? folder.split("/").map(segment => encodeURIComponent(segment)).join("/")
        : ""
    const url = encoded_folder
        ? `${SCENARIO_TEST_API_BASE}/api/test-powers/${encoded_folder}`
        : `${SCENARIO_TEST_API_BASE}/api/test-powers`

    const response = await fetch(url)
    if (response.status === 404)
        return create_empty_test_powers()
    if (!response.ok)
        throw Error(`failed to load test powers (${response.status})`)

    return parse_test_powers_json(await response.text())
}

export const save_test_powers_by_path = async ({
                                                 test_path,
                                                 file,
                                             }: {
    test_path: string
    file: TestPowersFile
}): Promise<string> => {
    const folder = get_test_folder_path(test_path)
    const encoded_folder = folder
        ? encode_scenario_path_for_url(folder)
        : ""
    const url = encoded_folder
        ? `${SCENARIO_TEST_API_BASE}/api/test-powers/${encoded_folder}`
        : `${SCENARIO_TEST_API_BASE}/api/test-powers`

    const response = await fetch(url, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: serialize_test_powers_json(file),
    })
    if (!response.ok)
        throw Error(`failed to save test powers (${response.status})`)

    const body = await response.json() as { saved: string }
    return body.saved
}
