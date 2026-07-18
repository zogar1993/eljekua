import {SquareHighlight} from "scripts/battlegrid/squares/SquareHighlight";
import {create_html_element} from "web_components/utils/create_html_element";

export type SquareVisual = {
    set_highlight: (value: SquareHighlight) => void
    set_interaction_status: (value: "hover" | "none") => void
}

export const create_visual_square = ({x, y}: { x: number, y: number }): SquareVisual => {
    const html_board = document.querySelector(".board")!

    const html_square = create_html_element("div", "board__square")
    html_square.setAttribute("x", `${x}`)
    html_square.setAttribute("y", `${y}`)

    html_board.appendChild(html_square)

    return {
        set_highlight: (value: SquareHighlight) => {
            if (value === "none")
                delete html_square.dataset["indicator"]
            else
                html_square.dataset["indicator"] = value
        },
        set_interaction_status: (value: "hover" | "none") => {
            if (value === "none")
                delete html_square.dataset["interaction_status"]
            else
                html_square.dataset["interaction_status"] = value
        }
    }
}
