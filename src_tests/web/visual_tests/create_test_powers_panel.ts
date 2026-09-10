import type {IRPower} from "core/types";
import {get_test_powers_relative_file} from "scenario_test/get_test_folder_path";
import {create_field_group_title} from "web/visual_tests/create_labeled_field";
import {create_power_editor} from "web/visual_tests/power_editor/create_power_editor";
import {load_test_powers_by_path, save_test_powers_by_path} from "web/visual_tests/test_powers_api";
import {create_html_element} from "web/utils/create_html_element";

const AUTO_SAVE_DELAY_MS = 300

export const create_test_powers_panel = ({
                                             get_test_path,
                                             on_powers_changed,
                                         }: {
    get_test_path: () => string
    on_powers_changed: (powers: Array<IRPower>) => void
}) => {
    const html_root = create_html_element("div", "visual-tests__test-powers-panel")

    const html_status = create_html_element("div", "visual-tests__test-powers-status")
    html_status.textContent = "No powers saved for this test folder."

    let suppress_auto_save = false
    let auto_save_timer: ReturnType<typeof setTimeout> | undefined

    const set_status = (text: string) => {
        html_status.textContent = text
    }

    const refresh_available_powers = () => {
        on_powers_changed(power_editor.get_powers())
    }

    const persist_powers = async () => {
        if (suppress_auto_save)
            return

        const test_path = get_test_path()
        const powers = power_editor.get_powers()
        set_status("Saving powers...")
        try {
            const saved = await save_test_powers_by_path({
                test_path,
                file: {powers},
            })
            set_status(`Saved ${powers.length} power(s) to src_tests/scenarios/${saved}.`)
            refresh_available_powers()
        } catch (error) {
            set_status(error instanceof Error ? error.message : String(error))
        }
    }

    const schedule_persist_powers = () => {
        if (suppress_auto_save)
            return

        if (auto_save_timer !== undefined)
            clearTimeout(auto_save_timer)

        auto_save_timer = setTimeout(() => {
            auto_save_timer = undefined
            persist_powers()
        }, AUTO_SAVE_DELAY_MS)
    }

    const power_editor = create_power_editor({
        on_powers_changed: () => {
            refresh_available_powers()
            schedule_persist_powers()
        },
    })

    const load_powers_for_test = async (test_path: string) => {
        suppress_auto_save = true
        if (auto_save_timer !== undefined) {
            clearTimeout(auto_save_timer)
            auto_save_timer = undefined
        }

        try {
            const file = await load_test_powers_by_path(test_path)
            power_editor.set_powers(file.powers, {silent: true})
            const relative_file = get_test_powers_relative_file(test_path)
            set_status(file.powers.length > 0
                ? `Loaded ${file.powers.length} power(s) from src_tests/scenarios/${relative_file}.`
                : `No powers in src_tests/scenarios/${relative_file} yet.`)
            refresh_available_powers()
        } catch (error) {
            power_editor.set_powers([], {silent: true})
            set_status(error instanceof Error ? error.message : String(error))
            refresh_available_powers()
        } finally {
            suppress_auto_save = false
        }
    }

    html_root.append(
        create_field_group_title("Test powers"),
        html_status,
        power_editor.html_root,
    )

    return {
        html_root,
        load_powers_for_test,
        get_powers: () => power_editor.get_powers(),
    }
}
