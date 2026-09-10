import {build_scenario_test_tree, type ScenarioTestTreeNode} from "web/visual_tests/build_scenario_test_tree";
import {create_html_element} from "web/core/utils/create_html_element";

export const create_scenario_test_tree = ({
                                              on_test_click,
                                          }: {
    on_test_click: (path: string) => void
}) => {
    let selected_path = ""
    const expanded_paths = new Set<string>()
    let latest_paths: Array<string> = []

    const html_tree = create_html_element("div", "visual-tests__test-tree")
    const html_empty = create_html_element("div", "visual-tests__test-tree-empty")
    html_empty.textContent = "No saved tests"
    html_empty.hidden = true

    const expand_parent_folders = (paths: Array<string>) => {
        for (const path of paths) {
            const segments = path.split("/")
            for (let index = 1; index < segments.length; index++)
                expanded_paths.add(segments.slice(0, index).join("/"))
        }
    }

    const set_selected_path = (path: string) => {
        selected_path = path
        html_tree.querySelectorAll(".visual-tests__test-tree-item").forEach(element => {
            element.classList.toggle(
                "visual-tests__test-tree-item--selected",
                element instanceof HTMLElement && element.dataset["path"] === path,
            )
        })
    }

    const render_nodes = (nodes: Array<ScenarioTestTreeNode>, depth: number) => {
        const html_list = create_html_element("div", "visual-tests__test-tree-list")
        html_list.style.paddingLeft = `${depth * 12}px`

        for (const node of nodes) {
            if (node.is_folder) {
                const is_expanded = expanded_paths.has(node.path)
                const html_folder = create_html_element("div", "visual-tests__test-tree-folder")

                const html_toggle = document.createElement("button")
                html_toggle.type = "button"
                html_toggle.className = "visual-tests__test-tree-folder-toggle"
                html_toggle.textContent = `${is_expanded ? "▾" : "▸"} ${node.name}`
                html_toggle.addEventListener("click", () => {
                    if (expanded_paths.has(node.path))
                        expanded_paths.delete(node.path)
                    else
                        expanded_paths.add(node.path)
                    render_tree()
                })

                html_folder.append(html_toggle)

                if (is_expanded)
                    html_folder.append(render_nodes(node.children, depth + 1))

                html_list.append(html_folder)
                continue
            }

            const html_item = document.createElement("button")
            html_item.type = "button"
            html_item.className = "visual-tests__test-tree-item"
            html_item.dataset["path"] = node.path
            html_item.textContent = node.name
            html_item.addEventListener("click", () => {
                on_test_click(node.path)
            })

            html_list.append(html_item)
        }

        return html_list
    }

    const render_tree = () => {
        html_tree.replaceChildren()
        html_empty.hidden = true

        if (latest_paths.length === 0) {
            html_tree.append(html_empty)
            html_empty.hidden = false
            return
        }

        html_tree.append(render_nodes(build_scenario_test_tree(latest_paths), 0))
        if (selected_path.length > 0)
            set_selected_path(selected_path)
    }

    const refresh = async (paths: Array<string>) => {
        latest_paths = paths
        expand_parent_folders(paths)
        render_tree()
    }

    const show_error = (message: string) => {
        latest_paths = []
        html_tree.replaceChildren()
        html_empty.textContent = message
        html_empty.hidden = false
        html_tree.append(html_empty)
    }

    return {
        html_tree,
        refresh,
        show_error,
        get_selected_path: () => selected_path,
        set_selected_path,
    }
}
