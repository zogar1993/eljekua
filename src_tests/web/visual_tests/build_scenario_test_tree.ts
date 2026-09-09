export type ScenarioTestTreeNode = {
    name: string
    path: string
    is_folder: boolean
    children: Array<ScenarioTestTreeNode>
}

export const build_scenario_test_tree = (paths: Array<string>): Array<ScenarioTestTreeNode> => {
    type MutableNode = {
        children: Map<string, MutableNode>
        is_leaf: boolean
    }

    const root: MutableNode = {children: new Map(), is_leaf: false}

    for (const path of paths) {
        const segments = path.split("/").filter(segment => segment.length > 0)
        let node = root
        for (let index = 0; index < segments.length; index++) {
            const segment = segments[index]
            if (!node.children.has(segment))
                node.children.set(segment, {children: new Map(), is_leaf: false})
            node = node.children.get(segment)!
            if (index === segments.length - 1)
                node.is_leaf = true
        }
    }

    const to_tree_nodes = (node: MutableNode, path_prefix: string): Array<ScenarioTestTreeNode> =>
        [...node.children.entries()]
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([name, child]) => {
                const path = path_prefix ? `${path_prefix}/${name}` : name
                const children = to_tree_nodes(child, path)
                return {
                    name,
                    path,
                    is_folder: child.children.size > 0,
                    children,
                }
            })

    return to_tree_nodes(root, "")
}
