import {SquareVisual} from "scripts/battlegrid/squares/SquareVisual";
import {BattleGridVisual} from "scripts/battlegrid/BattleGridVisual";
import {ActionLog} from "scripts/action_log/ActionLog";
import {InitiativeEntryVisual} from "scripts/initiative_order/InitiativeEntryVisual";
import {InstructionVisualizer} from "scripts/instruction_visualizer/instruction_visualizer";

const create_visual_square = (): SquareVisual => ({
    set_highlight: jest.fn(),
    set_interaction_status: jest.fn()
})

const create_battle_grid_visual = (): BattleGridVisual => ({
    addOnMouseMoveHandler: jest.fn(),
    addOnClickHandler: jest.fn(),
})

const create_initiative_entry_visual = (): InitiativeEntryVisual => ({
    set_current_turn: jest.fn()
})

const instruction_visualizer: InstructionVisualizer = {
    show: jest.fn()
}

const action_log: ActionLog = {
    add_new_action_log: jest.fn
}

export const dependency_mocks = {
    create_visual_square,
    create_battle_grid_visual,
    create_initiative_entry_visual,
    instruction_visualizer,
    action_log,
}