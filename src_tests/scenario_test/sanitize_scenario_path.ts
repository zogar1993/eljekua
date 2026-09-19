export const sanitize_scenario_path = (scenario_path: string) => {
    const segments = scenario_path
        .split("/")
        .map(segment => segment.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_|_$/g, ""))
        .filter(segment => segment.length > 0)
    return segments.length > 0 ? segments.join("/") : "untitled_scenario"
}

export const scenario_path_to_relative_file = (scenario_path: string) =>
    `${sanitize_scenario_path(scenario_path)}.json`

export const encode_scenario_path_for_url = (scenario_path: string) =>
    sanitize_scenario_path(scenario_path)
        .split("/")
        .map(segment => encodeURIComponent(segment))
        .join("/")

export const decode_scenario_path_from_url = (url_path: string) =>
    sanitize_scenario_path(
        url_path.split("/").map(segment => decodeURIComponent(segment)).join("/"),
    )

export const suggest_scenario_copy_path = (source_path: string) => {
    const sanitized = sanitize_scenario_path(source_path)
    const last_slash = sanitized.lastIndexOf("/")
    if (last_slash < 0)
        return `${sanitized}_copy`

    const folder = sanitized.slice(0, last_slash + 1)
    const name = sanitized.slice(last_slash + 1)
    return `${folder}${name}_copy`
}
