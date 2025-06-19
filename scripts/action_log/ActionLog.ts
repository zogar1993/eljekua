import {add_all_resolved_number_values, ResolvedNumberValue} from "formulas/IntFormulaFromTokens";
import {assert} from "assert";

export class ActionLog {
    add_new_action_log = (...text: Array<string | Array<ResolvedNumberValue>>) => {
        const action_log = document.querySelector("#action_log")!

        const action_log_entry = document.createElement("div");
        action_log_entry.className = "action-log__line"

        text.forEach(part => {
                if (typeof part === "string")
                    action_log_entry.append(part)
                else {
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