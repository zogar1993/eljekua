import {InitiativeEntryVisual} from "core/initiative_order/InitiativeEntryVisual";

const create_initiative_entry_visual = (): InitiativeEntryVisual => ({
    set_current_turn: jest.fn()
})

export const dependency_mocks = {
    create_initiative_entry_visual,
}