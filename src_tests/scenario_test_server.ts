import {exec} from "node:child_process"
import fs from "node:fs/promises"
import http from "node:http"
import path from "node:path"
import {fileURLToPath} from "node:url"
import type {IncomingMessage, ServerResponse} from "node:http"
import {decode_scenario_path_from_url, scenario_path_to_relative_file} from "scenario_test/sanitize_scenario_path"

const PORT = 3456
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const SCENARIOS_DIR = path.join(REPO_ROOT, "src_tests", "scenarios")

const CONTENT_TYPES: Record<string, string> = {
    ".css": "text/css",
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
}

const get_scenario_file_path = (scenario_path: string) => {
    const relative_file = scenario_path_to_relative_file(scenario_path)
    const file_path = path.join(SCENARIOS_DIR, relative_file)
    const resolved = path.resolve(file_path)
    if (!resolved.startsWith(path.resolve(SCENARIOS_DIR)))
        throw Error("invalid scenario path")
    return resolved
}

const get_static_file_path = (url_path: string) => {
    const relative_path = url_path === "/" ? "src_tests/visual-tests.html" : url_path.replace(/^\//, "")
    const normalized = path.normalize(relative_path)
    if (normalized.startsWith(".."))
        throw Error("invalid static path")
    const file_path = path.join(REPO_ROOT, normalized)
    if (!file_path.startsWith(REPO_ROOT))
        throw Error("invalid static path")
    return file_path
}

const get_content_type = (file_path: string) => {
    const extension = path.extname(file_path)
    return CONTENT_TYPES[extension] ?? "application/octet-stream"
}

const read_body = (request: IncomingMessage) => new Promise<string>((resolve, reject) => {
    const chunks: Array<Buffer> = []
    request.on("data", chunk => chunks.push(chunk))
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
    request.on("error", reject)
})

const send_json = (response: ServerResponse, status_code: number, body: unknown) => {
    response.writeHead(status_code, {"Content-Type": "application/json"})
    response.end(JSON.stringify(body))
}

const send_static_file = async (response: ServerResponse, url_path: string) => {
    const file_path = get_static_file_path(url_path)
    const contents = await fs.readFile(file_path)
    response.writeHead(200, {"Content-Type": get_content_type(file_path)})
    response.end(contents)
}

const list_scenarios = async ({
                                  directory = SCENARIOS_DIR,
                                  path_prefix = "",
                              }: {
    directory?: string
    path_prefix?: string
} = {}): Promise<Array<string>> => {
    await fs.mkdir(SCENARIOS_DIR, {recursive: true})
    const entries = await fs.readdir(directory, {withFileTypes: true})
    const scenarios: Array<string> = []

    for (const entry of entries) {
        const entry_path = path.join(directory, entry.name)
        if (entry.isDirectory()) {
            const nested_prefix = path_prefix ? `${path_prefix}/${entry.name}` : entry.name
            scenarios.push(...await list_scenarios({directory: entry_path, path_prefix: nested_prefix}))
            continue
        }

        if (entry.isFile() && entry.name.endsWith(".json")) {
            const scenario_name = entry.name.slice(0, -".json".length)
            scenarios.push(path_prefix ? `${path_prefix}/${scenario_name}` : scenario_name)
        }
    }

    return scenarios.sort()
}

const open_visual_tests = () => {
    const url = `http://localhost:${PORT}/`
    const command = process.platform === "darwin" ? `open "${url}"` : `xdg-open "${url}"`
    exec(command)
}

const server = http.createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`)

    try {
        if (request.method === "GET" && url.pathname === "/api/scenarios") {
            const scenarios = await list_scenarios()
            send_json(response, 200, {scenarios})
            return
        }

        const scenario_match = url.pathname.match(/^\/api\/scenarios\/(.+)$/)
        if (scenario_match) {
            const scenario_path = decode_scenario_path_from_url(scenario_match[1])

            if (request.method === "GET") {
                const file_path = get_scenario_file_path(scenario_path)
                const contents = await fs.readFile(file_path, "utf8")
                response.writeHead(200, {"Content-Type": "application/json"})
                response.end(contents)
                return
            }

            if (request.method === "PUT") {
                const body = await read_body(request)
                const parsed = JSON.parse(body)
                const file_path = get_scenario_file_path(scenario_path)
                await fs.mkdir(path.dirname(file_path), {recursive: true})
                await fs.writeFile(file_path, `${JSON.stringify(parsed, null, 2)}\n`, "utf8")
                send_json(response, 200, {saved: path.relative(SCENARIOS_DIR, file_path)})
                return
            }
        }

        if (request.method === "GET")
            await send_static_file(response, url.pathname)

        else
            send_json(response, 404, {error: "not found"})
    } catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "ENOENT")
            send_json(response, 404, {error: "not found"})
        else
            send_json(response, 500, {error: error instanceof Error ? error.message : String(error)})
    }
})

server.listen(PORT, () => {
    console.log(`visual tests dev server listening on http://localhost:${PORT}`)
    open_visual_tests()
})
