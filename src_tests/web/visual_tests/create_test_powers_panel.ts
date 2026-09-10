import type {IRPower} from "core/types";
import {create_power_editor} from "web/visual_tests/power_editor/create_power_editor";
import {load_test_powers_by_path, save_test_powers_by_path} from "web/visual_tests/test_powers_api";
import {create_html_element} from "web/core/utils/create_html_element";

const AUTO_SAVE_DELAY_MS = 300

export const create_test_powers_panel = ({
                                             get_test_path,
                                             on_powers_changed,
                                         }: {
    get_test_path: () => string
    on_powers_changed: (powers: Array<IRPower>) => void
}) => {
    const html_root = create_html_element("div", "visual-tests__test-powers-panel")

    let suppress_auto_save = false
    let auto_save_timer: ReturnType<typeof setTimeout> | undefined

    const refresh_available_powers = () => {
        on_powers_changed(power_editor.get_powers())
    }

    const persist_powers = async () => {
        if (suppress_auto_save)
            return

        const test_path = get_test_path()
        const powers = power_editor.get_powers()
        try {
            await save_test_powers_by_path({
                test_path,
                file: {powers},
            })
            refresh_available_powers()
        } catch (error) {
            console.error(error)
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
            refresh_available_powers()
        } catch (error) {
            power_editor.set_powers([], {silent: true})
            console.error(error)
            refresh_available_powers()
        } finally {
            suppress_auto_save = false
        }
    }

    html_root.append(power_editor.html_root)

    return {
        html_root,
        load_powers_for_test,
        get_powers: () => power_editor.get_powers(),
    }
}
