import type {IRPower} from "core/types";
import {create_auto_save_scheduler} from "web/visual_tests/create_auto_save_scheduler";
import {create_power_editor} from "web/visual_tests/power_editor/create_power_editor";
import {load_test_powers_by_path, save_test_powers_by_path} from "web/visual_tests/test_powers_api";
import {create_html_element} from "web/core/utils/create_html_element";

export const create_test_powers_panel = ({
                                             get_test_path,
                                             on_powers_changed,
                                         }: {
    get_test_path: () => string
    on_powers_changed: (powers: Array<IRPower>) => void
}) => {
    const html_root = create_html_element("div", "visual-tests__test-powers-panel")

    const refresh_available_powers = () => {
        on_powers_changed(power_editor.get_powers())
    }

    const auto_save = create_auto_save_scheduler({
        persist: async () => {
            const test_path = get_test_path()
            if (!test_path)
                return

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
        },
    })

    const power_editor = create_power_editor({
        on_powers_changed: () => {
            refresh_available_powers()
            auto_save.schedule_auto_save()
        },
    })

    const load_powers_for_test = async (test_path: string) => {
        await auto_save.run_without_auto_save(async () => {
            try {
                const file = await load_test_powers_by_path(test_path)
                power_editor.set_powers(file.powers, {silent: true})
                refresh_available_powers()
            } catch (error) {
                power_editor.set_powers([], {silent: true})
                console.error(error)
                refresh_available_powers()
            }
        })
    }

    html_root.append(power_editor.html_root)

    return {
        html_root,
        load_powers_for_test,
        get_powers: () => power_editor.get_powers(),
    }
}
