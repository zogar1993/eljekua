import {Creature} from "core/battlegrid/creatures/Creature";
import {HitStatus} from "core/battlegrid/player_turn_handler/HitStatus";
import {HitStatusButtons} from "core/battlegrid/hit_status_buttons/HitStatusButtons";

const state: {
    on_status_change: ((creature: Creature, status: HitStatus) => void) | null
    on_confirm: (() => void) | null
} = {
    on_status_change: null,
    on_confirm: null,
}

export const hit_status_buttons_test_ui: HitStatusButtons = {
    display: ({on_status_change, on_confirm}) => {
        state.on_status_change = on_status_change
        state.on_confirm = on_confirm
    },
    remove: () => {
        state.on_status_change = null
        state.on_confirm = null
    },
}
