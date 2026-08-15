import {GameEvents} from "core/events/GameEvents";
import {HitStatus} from "core/battlegrid/player_turn_handler/HitStatus";
import {Creature} from "core/battlegrid/creatures/Creature";
import {
    create_creature_hit_status_visual,
    CreatureHitStatusVisual
} from "web/hit_status_buttons/CreatureHitStatusVisual";
import {create_option_button_visual, CreatureOptionButton} from "web/creature_option_buttons/CreatureOptionButton";
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

    game_events.on_available_interactions_changed.add_handler((interactions) => {
        if (interactions?.type === "hit_status_select")
            display({
                hit_statuses: interactions.hit_statuses,
                on_status_change: interactions.on_status_change,
                on_confirm: interactions.on_confirm!,
            })
        else
            remove()
    })
}
