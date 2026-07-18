import {Expr, ExprNumberResolved} from "scripts/expressions/evaluator/types";

export const create_expression_html = (expr: Expr): HTMLElement => {
    const html_expression = document.createElement("span")
    html_expression.className = "expression"


    const show_line = (result: ExprNumberResolved, container: HTMLDivElement) => {
        const line = document.createElement("div")
        line.className = "expression__line"
        line.append(`${result.description}: ${result.value}`)
        container.appendChild(line)
    }
    const add_sub_parts = (result: ExprNumberResolved, container: HTMLDivElement) => {
        if (result.params) {
            const sub_details = document.createElement("div")
            sub_details.className = "expression__sub-details"
            container.appendChild(sub_details)

            result.params.map(resolved => {
                if (resolved.type === "number_resolved") {
                    add_sub_parts(resolved, sub_details)
                }
            })
        }
        show_line(result, container)
    }

    switch (expr.type) {
        case "number_resolved": {
            html_expression.append(`${expr.value}`)

            const details = document.createElement("div")
            details.className = "expression__details"
            add_sub_parts(expr, details)
            html_expression.appendChild(details)

            return html_expression
        }
        default: {
            throw new Error(`Unsupported expression type ${expr.type}`)
        }
    }
}
