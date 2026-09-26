import type {GameEvents} from "core/events/GameEvents";
import type {InstructionLoop} from "core/instruction_loop";
import {INTERACTION_TYPE} from "core/interactions/Interactions";
import type {CreatureD20RollVisual} from "web/core/d20_roll_buttons/CreatureD20RollVisual";
import {create_creature_d20_roll_visual} from "web/core/d20_roll_buttons/CreatureD20RollVisual";
import {AssertionError} from "stdlib/AssertionError";

export const create_d20_roll_buttons_ui = ({game_events, game_inputs}: {
    game_events: GameEvents,
    game_inputs: InstructionLoop
}) => {
    let creature_visuals: Array<CreatureD20RollVisual> = []

    game_events.on_available_interactions_changed.add_handler((interaction) => {
        if (interaction?.type === INTERACTION_TYPE.D20_ROLL_SELECT) {
            const d20_rolls: Map<number, number> = new Map()

            if (creature_visuals.length > 0)
                throw new AssertionError("d20 roll buttons were attempted to be displayed without cleaning up before")

            creature_visuals = interaction.creature_ids.map((creature_id, index) =>
                create_creature_d20_roll_visual({
                    creature_id,
                    on_roll_change: (value) => {
                        creature_visuals[index].set_selected(value)
                        d20_rolls.set(creature_id, value)

                        const entries = Array.from(d20_rolls.entries())
                        if (entries.length === interaction.creature_ids.length) {
                            const rolls = entries.map(([creature_id, value]) => ({creature_id, value}))
                            game_inputs.select({type: INTERACTION_TYPE.D20_ROLL_SELECT, d20_rolls: rolls})
                        }
                    },
                })
            )

            creature_visuals[0]?.focus()
        } else if (creature_visuals.length > 0) {
            creature_visuals.forEach(visual => visual.remove())
            creature_visuals = []
        }
    })
}
