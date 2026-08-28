import type {GameEvents} from "core/events/GameEvents";
import {INTERACTION_TYPE} from "core/instruction_loop";
import type {HitStatus} from "core/virtual_machine/expressions/constants/HitStatus";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {CreatureHitStatusVisual} from "web/hit_status_buttons/CreatureHitStatusVisual";
import {create_creature_hit_status_visual} from "web/hit_status_buttons/CreatureHitStatusVisual";
import type {CreatureOptionButton} from "web/creature_option_buttons/CreatureOptionButton";
import {create_option_button_visual} from "web/creature_option_buttons/CreatureOptionButton";
import {AssertionError} from "stdlib/AssertionError";

export const create_hit_status_buttons_ui = ({game_events}: { game_events: GameEvents }) => {
    let creature_visuals: Array<CreatureHitStatusVisual> = []
    let end_button_visual: CreatureOptionButton | null = null

    const remove = () => {
        creature_visuals.forEach(visual => visual.remove())
        creature_visuals = []
        end_button_visual?.remove()
        end_button_visual = null
    }

    const display = ({
                         hit_statuses,
                         on_status_change,
                         on_confirm,
                     }: {
        hit_statuses: Map<Creature, HitStatus>
        on_status_change: (creature: Creature, status: HitStatus) => void
        on_confirm: () => void
    }) => {
        if (creature_visuals.length > 0 || end_button_visual !== null)
            throw new AssertionError("hit status buttons were attempted to be displayed without cleaning up before")

        creature_visuals = [...hit_statuses].map(([creature, current_status], index) =>
            create_creature_hit_status_visual({
                creature,
                current_status,
                on_status_change: (status) => {
                    on_status_change(creature, status)
                    creature_visuals[index].set_selected(status)
                },
            })
        )

        end_button_visual = create_option_button_visual({
            text: "End",
            disabled: false,
            on_click: on_confirm,
        })
    }

    game_events.on_available_interactions_changed.add_handler((interaction) => {
        if (interaction?.type === INTERACTION_TYPE.HIT_STATUS_SELECT)
            display({
                hit_statuses: interaction.hit_statuses,
                on_status_change: interaction.on_status_change,
                on_confirm: interaction.on_confirm!,
            })
        else
            remove()
    })
}
