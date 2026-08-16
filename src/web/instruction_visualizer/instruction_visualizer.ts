import {Instruction} from "core/virtual_machine/instructions/instructions";
import {Expr} from "core/virtual_machine/expressions/types";
import {GameEvents} from "core/events/GameEvents";
import {create_html_element} from "web/utils/create_html_element";
import {create_expression_html} from "web/expression/create_expression_html";
import {AstNode} from "core/expressions/parser/nodes/AstNode";

type FrameElements = {
    variablesToggle?: HTMLElement
    variablesContainer?: HTMLElement
    variableElements: Array<HTMLElement>
    instructionElements: Array<HTMLElement>
    separator?: HTMLElement
}

export const create_instruction_visualizer = ({game_events}: { game_events: GameEvents }) => {
    const html_panel = document.querySelector("#instructions")!
    html_panel.classList.add("instruction-panel")

    const html_header = create_html_element("div", "instruction-panel__header")
    html_header.textContent = "Instructions"

    const html_content = create_html_element("div", "instruction-panel__content")
    html_panel.append(html_header, html_content)

    const frame_elements: Array<FrameElements> = []

    game_events.on_turn_state_cleared.add_handler(() => {
        frame_elements.length = 0
        html_content.replaceChildren()
    })

    game_events.on_instruction_frame_added.add_handler(({instructions, variables}) => {
        const frame: FrameElements = {
            variableElements: [],
            instructionElements: [],
        }

        if (frame_elements.length > 0) {
            frame.separator = create_html_element("div", "instruction__frame-separator")
            html_content.append(frame.separator)
        }

        if (variables.size > 0) {
            ensure_variables_section(frame, html_content)

            for (const [name, value] of variables) {
                const html_variable = create_variable_element(name, value)
                frame.variableElements.push(html_variable)
                frame.variablesContainer!.append(html_variable)
            }
        }

        for (const instruction of instructions) {
            const html_instruction = create_visual_for_instruction(instruction)
            frame.instructionElements.push(html_instruction)
            html_content.append(html_instruction)
        }

        update_current_instruction_highlight(frame)
        frame_elements.push(frame)
    })

    game_events.on_instructions_prepended.add_handler((instructions) => {
        const frame = frame_elements[frame_elements.length - 1]
        const new_elements = instructions.map(create_visual_for_instruction)
        const insert_before = frame.instructionElements[0] ?? null

        for (let i = new_elements.length - 1; i >= 0; i--)
            html_content.insertBefore(new_elements[i], insert_before)

        frame.instructionElements = [...new_elements, ...frame.instructionElements]
        update_current_instruction_highlight(frame)
    })

    game_events.on_instruction_consumed.add_handler(() => {
        const frame = frame_elements[frame_elements.length - 1]
        const [removed, ...rest] = frame.instructionElements
        if (removed) {
            removed.remove()
            frame.instructionElements = rest
            update_current_instruction_highlight(frame)
        }
    })

    game_events.on_instruction_frame_popped.add_handler(() => {
        const frame = frame_elements.pop()!
        for (const element of [
            frame.separator,
            frame.variablesToggle,
            frame.variablesContainer,
            ...frame.instructionElements,
        ])
            if (element) element.remove()
    })

    game_events.on_turn_state_variable_set.add_handler(([name, value]) => {
        const frame = frame_elements[frame_elements.length - 1]
        const existing = frame.variableElements.find(element => element.dataset.variableName === name)

        if (existing) {
            update_variable_value(existing, value)
        } else {
            ensure_variables_section(frame, html_content)
            const html_variable = create_variable_element(name, value)
            frame.variableElements.push(html_variable)
            frame.variablesContainer!.append(html_variable)
        }
    })
}

export type InstructionVisualizer = ReturnType<typeof create_instruction_visualizer>

const update_current_instruction_highlight = (frame: FrameElements) => {
    for (let i = 0; i < frame.instructionElements.length; i++)
        frame.instructionElements[i].classList.toggle("instruction--current", i === 0)
}

const ensure_variables_section = (frame: FrameElements, html_content: HTMLElement) => {
    if (frame.variablesContainer) return

    frame.variablesToggle = create_html_element("div", "instruction__variables-toggle")
    frame.variablesContainer = create_html_element("div", "instruction__variables")
    frame.variablesContainer.classList.add("instruction__variables--collapsed")
    wire_variables_toggle(frame.variablesToggle, frame.variablesContainer)

    const insert_before = frame.instructionElements[0] ?? null
    html_content.insertBefore(frame.variablesContainer, insert_before)
    html_content.insertBefore(frame.variablesToggle, frame.variablesContainer)
}

const wire_variables_toggle = (toggle: HTMLElement, variables_container: HTMLElement) => {
    const expand_icon = create_html_element("div", "expand_icon")
    const label = create_html_element("span", "instruction__variables-label")
    label.textContent = "Variables"

    toggle.append(expand_icon, label)

    toggle.addEventListener("click", () => {
        variables_container.classList.toggle("instruction__variables--collapsed")
        toggle.classList.toggle("instruction__variables-toggle--expanded")
    })
}

const create_variable_element = (name: string, value: Expr) => {
    const html_variable = create_html_element("div", "instruction__variable")
    html_variable.dataset.variableName = name

    const name_span = create_html_element("span", "instruction__variable-name")
    name_span.textContent = name

    const value_span = create_html_element("span", "instruction__variable-value")
    append_expr_value(value_span, value)

    html_variable.append(name_span, value_span)
    return html_variable
}

const update_variable_value = (html_variable: HTMLElement, value: Expr) => {
    const value_span = html_variable.querySelector(".instruction__variable-value") as HTMLElement
    value_span.replaceChildren()
    append_expr_value(value_span, value)
}

const append_expr_value = (container: HTMLElement, expr: Expr) => {
    if (expr.type === "number_resolved") {
        container.append(create_expression_html(expr))
    } else {
        container.textContent = format_expr_summary(expr)
    }
}

const format_expr_summary = (expr: Expr): string => {
    switch (expr.type) {
        case "number_unresolved":
            return expr.description
        case "number_resolved":
            return String(expr.value)
        case "string":
            return expr.value
        case "boolean":
            return String(expr.value)
        case "creatures":
            return expr.value.map(creature => creature.data.name).join(", ")
        case "positions":
            return expr.value.map(position => `(${position.x}, ${position.y})`).join(", ")
        case "power":
            return expr.value.name
        case "attack_rolls":
            return `${expr.value.size} roll(s)`
    }
}

const create_visual_for_instruction = (instruction: Instruction) => {
    const html_instruction = create_html_element("div", "instruction")
    html_instruction.classList.add(`instruction--type-${instruction.type}`)

    const name_line = create_html_element("div", "instruction__name-line")
    const type_badge = create_html_element("span", "instruction__type-badge")
    type_badge.textContent = instruction.type

    const detail_entries = Object.entries(instruction).filter(([key]) => key !== "type")

    if (detail_entries.length === 0) {
        name_line.classList.add("instruction__name-line--static")
        name_line.append(type_badge)
        html_instruction.append(name_line)
        return html_instruction
    }

    const expand_icon = create_html_element("div", "expand_icon")
    const instruction_details = create_html_element("div", "instruction__details")
    instruction_details.classList.add("instruction__details--collapsed")

    for (const [key, value] of detail_entries) {
        const row = create_html_element("div", "instruction__detail-row")
        const key_span = create_html_element("span", "instruction__detail-key")
        key_span.textContent = key
        const value_span = create_html_element("span", "instruction__detail-value")
        value_span.textContent = format_instruction_value(value)

        row.append(key_span, value_span)
        instruction_details.append(row)
    }

    name_line.addEventListener("click", () => {
        instruction_details.classList.toggle("instruction__details--collapsed")
        html_instruction.classList.toggle("instruction--expanded")
    })

    html_instruction.append(name_line, instruction_details)
    name_line.append(expand_icon, type_badge)

    return html_instruction
}

const format_instruction_value = (value: unknown): string => {
    if (value === null || value === undefined) return String(value)
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
        return String(value)
    if (Array.isArray(value)) {
        if (value.length > 0 && is_instruction(value[0]))
            return `${value.length} instruction(s)`
        return value.map(item => format_instruction_value(item)).join(", ")
    }
    if (typeof value === "object") {
        if (is_instruction(value))
            return value.type
        if (is_ast_node(value))
            return format_ast_node(value)
        return JSON.stringify(value)
    }
    return String(value)
}

const is_instruction = (value: unknown): value is Instruction =>
    typeof value === "object" && value !== null && "type" in value && !is_ast_node(value)

const is_ast_node = (value: unknown): value is AstNode =>
    typeof value === "object" && value !== null && "type" in value &&
    ["number", "keyword", "dice", "weapon", "function", "string"].includes((value as AstNode).type)

const format_ast_node = (node: AstNode): string => {
    switch (node.type) {
        case "number":
            return String(node.value)
        case "keyword":
            return node.value
        case "string":
            return node.value
        case "dice":
            return `d${node.faces}`
        case "weapon":
            return `{${node.amount}W}`
        case "function":
            return `${node.name}(...)`
    }
}
