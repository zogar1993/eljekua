import {add_all_resolved_number_values, ResolvedNumberValue} from "expression_parsers/parse_expression_to_number_values";
import {assert} from "assert";

export class ActionLog {
    add_new_action_log = (...text: Array<string | DamageLog | Array<ResolvedNumberValue>>) => {
        const action_log = document.querySelector("#action_log")!

        const action_log_entry = document.createElement("div");
        action_log_entry.className = "action-log__line"

        text.forEach(part => {
                if (typeof part === "string")
                    action_log_entry.append(part)
                else if (is_damage_log(part)){
                    assert(part.breakdown.length > 0, () => "resolved number values should always contain something")

                    const span = document.createElement("span")
                    span.className = "action-log__value"
                    span.append(`${part.result}`)
                    action_log_entry.appendChild(span)

                    const details = document.createElement("div")
                    details.className = "action-log-details"
                    part.breakdown.map(resolved => {
                        const line = document.createElement("div")
                        line.className = "action-log-details__line"
                        line.append(`${resolved.description}: ${resolved.value}`)
                        details.appendChild(line)
                    });

                    if (part.halved) {
                        const line = document.createElement("div")
                        line.className = "action-log-details__line"
                        line.append(`HALVED`)
                        details.appendChild(line)
                    }

                    span.appendChild(details)
                } else {
                    assert(part.length > 0, () => "resolved number values should always contain something")
                    const value = add_all_resolved_number_values(part)

                    const span = document.createElement("span")
                    span.className = "action-log__value"
                    span.append(`${value}`)
                    action_log_entry.appendChild(span)

                    const details = document.createElement("div")
                    details.className = "action-log-details"
                    part.map(resolved => {
                        const line = document.createElement("div")
                        line.className = "action-log-details__line"
                        line.append(`${resolved.description}: ${resolved.value}`)
                        details.appendChild(line)
                    });

                    span.appendChild(details)
                }
            }
        )

        action_log.appendChild(action_log_entry)
    }
}

const is_damage_log = (entry: string | DamageLog | Array<ResolvedNumberValue>): entry is DamageLog => {
    return entry.hasOwnProperty("type")
}

export type DamageLog = {
    type: "damage"
    result: number,
    halved: boolean,
    breakdown: Array<ResolvedNumberValue>
}