import {SquareVisual} from "web_components/battle_grid/squares/SquareVisual";
import {InitiativeEntryVisual} from "core/initiative_order/InitiativeEntryVisual";

const create_visual_square = (): SquareVisual => ({
    set_highlight: jest.fn(),
    set_interaction_status: jest.fn()
})
const create_initiative_entry_visual = (): InitiativeEntryVisual => ({
    set_current_turn: jest.fn()
})

export const dependency_mocks = {
    create_visual_square,
    create_initiative_entry_visual,
}