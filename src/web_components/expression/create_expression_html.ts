import {Expr, ExprNumberResolved} from "scripts/expressions/evaluator/types";
import {create_html_element} from "web_components/utils/create_html_element";

export const create_expression_html = (expr: Expr): HTMLElement => {
    const html_expression = create_html_element("span", "expression")
    
    const show_line = (result: ExprNumberResolved, container: HTMLElement) => {
        const line = create_html_element("div", "expression__line")
        line.append(`${result.description}: ${result.value}`)
        container.appendChild(line)
    }
    const add_sub_parts = (result: ExprNumberResolved, container: HTMLElement) => {
        if (result.params) {
            const sub_details = create_html_element("div", "expression__sub-details")
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

            const details = create_html_element("div", "expression__details")
            add_sub_parts(expr, details)
            html_expression.appendChild(details)

            return html_expression
        }
        default: {
            throw new Error(`Unsupported expression type ${expr.type}`)
        }
    }
}
