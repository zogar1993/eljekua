import {SquareVisual} from "web_components/battle_grid/squares/SquareVisual";
import {InitiativeEntryVisual} from "scripts/initiative_order/InitiativeEntryVisual";
import {InstructionVisualizer} from "scripts/instruction_visualizer/instruction_visualizer";

const create_visual_square = (): SquareVisual => ({
    set_highlight: jest.fn(),
    set_interaction_status: jest.fn()
})
const create_initiative_entry_visual = (): InitiativeEntryVisual => ({
    set_current_turn: jest.fn()
})

const instruction_visualizer: InstructionVisualizer = {
    show: jest.fn()
}

export const dependency_mocks = {
    create_visual_square,
    create_initiative_entry_visual,
    instruction_visualizer,
}