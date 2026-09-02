import type {GameEvents} from "core/events/GameEvents";
import {InstructionLoop, INTERACTION_TYPE} from "core/instruction_loop";
import type {CreatureHitStatusVisual} from "web/hit_status_buttons/CreatureHitStatusVisual";
import {create_creature_hit_status_visual} from "web/hit_status_buttons/CreatureHitStatusVisual";
import {AssertionError} from "stdlib/AssertionError";
import type {HitStatus} from "core/virtual_machine/expressions/constants/HitStatus";

export const create_hit_status_buttons_ui = ({game_events, game_inputs}: {
    game_events: GameEvents,
    game_inputs: InstructionLoop
}) => {
    let creature_visuals: Array<CreatureHitStatusVisual> = []

    game_events.on_available_interactions_changed.add_handler((interaction) => {
        if (interaction?.type === INTERACTION_TYPE.HIT_STATUS_SELECT) {
            const hit_statuses: Map<number, HitStatus> = new Map()

            if (creature_visuals.length > 0)
                throw new AssertionError("hit status buttons were attempted to be displayed without cleaning up before")

            creature_visuals = interaction.creature_ids.map((creature_id, index) =>
                create_creature_hit_status_visual({
                    creature_id,
                    on_status_change: (status) => {
                        creature_visuals[index].set_selected(status)
                        hit_statuses.set(creature_id, status)

                        const entries = Array.from(hit_statuses.entries())
                        if (entries.length === interaction.creature_ids.length) {
                            const attack_rolls = entries.map(([creature_id, hit_status]) => ({creature_id, hit_status}))
                            game_inputs.select({type: INTERACTION_TYPE.HIT_STATUS_SELECT, attack_rolls})
                        }
                    },
                })
            )
        } else if (creature_visuals.length > 0) {
            creature_visuals.forEach(visual => visual.remove())
            creature_visuals = []
        }
    })
}
