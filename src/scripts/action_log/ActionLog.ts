import {Expr, ExprNumberResolved} from "scripts/expressions/token_evaluator/types";

export class ActionLog {
    add_new_action_log = (...text: Array<string | Expr>) => {
        const action_log = document.querySelector("#action_log")!

        const action_log_entry = document.createElement("div");
        action_log_entry.className = "action-log__line"

        text.forEach(part => {
                if (typeof part === "string") {
                    action_log_entry.append(part)
                } else if (is_typed(part)) {
                    const span = document.createElement("span")
                    span.className = "action-log__value"

                    const show_line = (result: ExprNumberResolved, container: HTMLDivElement) => {

                        const line = document.createElement("div")
                        line.className = "action-log-details__line"
                        line.append(`${result.description}: ${result.value}`)
                        container.appendChild(line)
                    }
                    const add_sub_parts = (result: ExprNumberResolved, container: HTMLDivElement) => {
                        if (result.params) {
                            const sub_details = document.createElement("div")
                            sub_details.className = "action-log-details__sub-details"
                            container.appendChild(sub_details)

                            result.params.map(resolved => {
                                if (resolved.type === "number_resolved") {
                                    add_sub_parts(resolved, sub_details)
                                }
                            })
                        }
                        show_line(result, container)
                    }

                    if (part.type === "number_resolved") {
                        span.append(`${part.value}`)
                        action_log_entry.appendChild(span)

                        const details = document.createElement("div")
                        details.className = "action-log-details"
                        add_sub_parts(part, details)
                        span.appendChild(details)
                    }
                }
            }
        )

        action_log.appendChild(action_log_entry)
    }
}

const is_typed = (entry: string | Expr): entry is Expr => {
    return entry.hasOwnProperty("type")
}
