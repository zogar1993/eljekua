import {Creature} from "scripts/battlegrid/creatures/Creature";
import {HitStatus} from "scripts/battlegrid/player_turn_handler/HitStatus";
import {OptionButton} from "scripts/battlegrid/option_buttons/OptionButtons";
import {OptionButtonVisual} from "scripts/battlegrid/option_buttons/OptionButtonVisual";
import {CreatureHitStatusVisual} from "scripts/battlegrid/hit_status_buttons/CreatureHitStatusVisual";

export const create_hit_status_buttons = ({
                                              create_creature_hit_status_visual,
                                              create_option_button_visual,
                                          }: {
    create_creature_hit_status_visual: (props: {
        creature: Creature
        current_status: HitStatus
        on_status_change: (status: HitStatus) => void
    }) => CreatureHitStatusVisual
    create_option_button_visual: (option: OptionButton) => OptionButtonVisual
}): HitStatusButtons => {
    let creature_visuals: Array<CreatureHitStatusVisual> = []
    let end_button_visual: OptionButtonVisual | null = null

    return {
        display: ({hit_statuses, on_status_change, on_confirm}) => {
            if (creature_visuals.length > 0 || end_button_visual !== null)
                throw new AssertionError("hit status buttons were attempted to be displayed without cleaning up before")

            creature_visuals = [ ...hit_statuses ].map(([creature, current_status], index) =>
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
        },
        remove: () => {
            creature_visuals.forEach(visual => visual.remove())
            creature_visuals = []
            end_button_visual?.remove()
            end_button_visual = null
        },
    }
}

export type HitStatusButtons = {
    display: (props: {
        hit_statuses: Map<Creature, HitStatus>
        on_status_change: (creature: Creature, status: HitStatus) => void
        on_confirm: () => void
    }) => void
    remove: () => void
}
