import {Expr} from "scripts/expressions/evaluator/types";
import {create_expression_html} from "web_components/expression/create_expression_html";

export const create_action_log = (): ActionLog => ({
    add_new_action_log: (...text: Array<string | Expr>) => {
        const action_log = document.querySelector("#action_log")!

        const action_log_entry = document.createElement("div");
        action_log_entry.className = "action-log__line"

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
})

export type ActionLog = {
    add_new_action_log: (...text: Array<string | Expr>) => void
}

const is_typed = (entry: string | Expr): entry is Expr => {
    return entry.hasOwnProperty("type")
}
