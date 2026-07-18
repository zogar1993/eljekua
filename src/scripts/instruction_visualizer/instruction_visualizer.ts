import {TurnState} from "scripts/battlegrid/player_turn_handler/TurnState";
import {Instruction} from "scripts/expressions/parser/instructions";
import {create_html_element} from "web_components/utils/create_html_element";

export const create_instruction_visualizer = () => {
    const html_instructions = document.querySelector("#instructions")!

    const show = (turn_state: TurnState) => {
        const elements: Array<HTMLElement> = []
        const frames = turn_state.get_power_frames()

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i]

            const variables = frame.get_variables().entries()
            for (const [key, value] of variables) {
                const html_variable = create_html_element("div", "instruction__variable")
                html_variable.textContent = `${key}: ${value.type}`
                elements.push(html_variable)
            }

            const instructions = frame.get_instructions()
            for(const instruction of instructions) {
                const html_instruction = create_visual_for_instruction(instruction)
                elements.push(html_instruction)
            }

            if (i < frames.length - 1) {
                const html_instruction = create_html_element("div", "instruction__frame-separator")
                html_instruction.textContent = `--------`
                elements.push(html_instruction)
            }
        }

        html_instructions.replaceChildren(...elements)
    }
    return {
        show
    }
}

export type InstructionVisualizer = ReturnType<typeof create_instruction_visualizer>

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