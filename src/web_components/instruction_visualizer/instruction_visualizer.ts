import {Instruction} from "scripts/expressions/parser/instructions";
import {Expr} from "scripts/expressions/evaluator/types";
import {GameEvents} from "scripts/events/GameEvents";
import {create_html_element} from "web_components/utils/create_html_element";

type FrameElements = {
    variableElements: Array<HTMLElement>
    instructionElements: Array<HTMLElement>
    separator?: HTMLElement
}

export const create_instruction_visualizer = ({game_events}: { game_events: GameEvents }) => {
    const html_instructions = document.querySelector("#instructions")!
    const frame_elements: Array<FrameElements> = []

    game_events.on_turn_state_cleared.add_handler(() => {
        frame_elements.length = 0
        html_instructions.replaceChildren()
    })

    game_events.on_instruction_frame_added.add_handler(({instructions, variables}) => {
        const frame: FrameElements = {variableElements: [], instructionElements: []}

        if (frame_elements.length > 0) {
            frame.separator = create_html_element("div", "instruction__frame-separator")
            frame.separator.textContent = `--------`
            html_instructions.append(frame.separator)
        }

        for (const [name, value] of variables) {
            const html_variable = create_variable_element(name, value)
            frame.variableElements.push(html_variable)
            html_instructions.append(html_variable)
        }

        for (const instruction of instructions) {
            const html_instruction = create_visual_for_instruction(instruction)
            frame.instructionElements.push(html_instruction)
            html_instructions.append(html_instruction)
        }

        frame_elements.push(frame)
    })

    game_events.on_instructions_prepended.add_handler((instructions) => {
        const frame = frame_elements[frame_elements.length - 1]
        const new_elements = instructions.map(create_visual_for_instruction)
        const insert_before = frame.instructionElements[0] ?? null

        for (let i = new_elements.length - 1; i >= 0; i--)
            html_instructions.insertBefore(new_elements[i], insert_before)

        frame.instructionElements = [...new_elements, ...frame.instructionElements]
    })

    game_events.on_instruction_consumed.add_handler(() => {
        const frame = frame_elements[frame_elements.length - 1]
        const [removed, ...rest] = frame.instructionElements
        if (removed) {
            removed.remove()
            frame.instructionElements = rest
        }
    })

    game_events.on_instruction_frame_popped.add_handler(() => {
        const frame = frame_elements.pop()!
        for (const element of [frame.separator, ...frame.variableElements, ...frame.instructionElements])
            if (element) element.remove()
    })

    game_events.on_turn_state_variable_set.add_handler(([name, value]) => {
        const frame = frame_elements[frame_elements.length - 1]
        const existing = frame.variableElements.find(element => element.dataset.variableName === name)

        if (existing) {
            existing.textContent = `${name}: ${value.type}`
        } else {
            const html_variable = create_variable_element(name, value)
            frame.variableElements.push(html_variable)
            html_instructions.insertBefore(html_variable, frame.instructionElements[0] ?? null)
        }
    })
}

export type InstructionVisualizer = ReturnType<typeof create_instruction_visualizer>

const create_variable_element = (name: string, value: Expr) => {
    const html_variable = create_html_element("div", "instruction__variable")
    html_variable.dataset.variableName = name
    html_variable.textContent = `${name}: ${value.type}`
    return html_variable
}

const create_visual_for_instruction = (instruction: Instruction) => {
    switch (instruction.type) {
        default: {
            const html_instruction = create_html_element("div", "instruction")

            const name_line = create_html_element("div", "instruction__name-line")

            const expand_icon = create_html_element("div", "expand_icon")
            const instruction_name = create_html_element("span", "instruction__name")
            instruction_name.textContent = instruction.type

            const instruction_details = create_html_element("dt", "instruction__details")

            html_instruction.append(name_line, instruction_details)
            name_line.append(expand_icon, instruction_name)

            return html_instruction
        }
    }
}