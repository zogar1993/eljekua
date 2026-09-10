import type {GameEvents} from "core/events/GameEvents";
import type {HitStatus} from "core/virtual_machine/expressions/constants/HitStatus";
import {HIT_STATUS} from "core/virtual_machine/expressions/constants/HitStatus";
import type {Expr} from "core/virtual_machine/expressions/types";
import {create_expression_html} from "web/core/expression/create_expression_html";
import {create_html_element} from "web/core/utils/create_html_element";

const HIT_STATUS_TEXT = new Map<HitStatus, string>([
    [HIT_STATUS.MISS, "misses"],
    [HIT_STATUS.HIT, "hits"],
    [HIT_STATUS.CRIT, "crits"]
])

export const create_action_log = ({game_events}: { game_events: GameEvents }) => {
    const add_new_action_log = (...text: Array<string | Expr>) => {
        const action_log = document.querySelector("#action_log")!

        const action_log_entry = create_html_element("div", "action-log__line")

        text.forEach(part => {
                if (typeof part === "string") {
                    action_log_entry.append(part)
                } else if (is_typed(part)) {
                    const html_expression = create_expression_html(part)
                    action_log_entry.append(html_expression)
                }
            }
        )

        action_log.appendChild(action_log_entry)
    }

    game_events.on_creature_received_damage.add_handler(({creature, damage}) => {
        add_new_action_log(`${creature.data.name} was dealt `, damage, ` damage.`)
    })

    game_events.on_creature_attacked.add_handler(({
                                                      creature,
                                                      attack,
                                                      defense,
                                                      hit_status,
                                                      defender,
                                                      instruction,
                                                      power_name
                                                  }) => {
        add_new_action_log(
            `${creature.data.name}'s ${power_name} (`,
            attack,
            `) ${HIT_STATUS_TEXT.get(hit_status)} against ${defender.data.name}'s ${instruction.defense} (`,
            defense,
            `).`)
    })
}

const is_typed = (entry: string | Expr): entry is Expr => {
    return entry.hasOwnProperty("type")
}
