import type {Structure} from "core/battlegrid/Structure";
import type {SquareHighlight} from "web/core/battle_grid/squares/SquareHighlight";
import {create_html_element} from "web/core/utils/create_html_element";

export const create_visual_square = ({x, y}: { x: number, y: number }) => {
    const html_board = document.querySelector(".board")!

    const html_square = create_html_element("div", "board__square")
    html_square.setAttribute("x", `${x}`)
    html_square.setAttribute("y", `${y}`)

    html_board.appendChild(html_square)

    return {
        set_highlight: (value: SquareHighlight | null) => {
            if (value === null)
                delete html_square.dataset["indicator"]
            else
                html_square.dataset["indicator"] = value
        },
        set_interaction_status: (value: "hover" | "none") => {
            if (value === "none")
                delete html_square.dataset["interaction_status"]
            else
                html_square.dataset["interaction_status"] = value
        },
        set_structure: (structure: Structure | null) => {
            if (structure === null) {
                delete html_square.dataset["structure"]
                delete html_square.dataset["blocks_movement"]
                delete html_square.dataset["blocks_line_of_sight"]
                delete html_square.dataset["blocks_line_of_effect"]
            } else {
                html_square.dataset["structure"] = "true"
                html_square.dataset["blocks_movement"] = `${structure.blocks_movement}`
                html_square.dataset["blocks_line_of_sight"] = `${structure.blocks_line_of_sight}`
                html_square.dataset["blocks_line_of_effect"] = `${structure.blocks_line_of_effect}`
            }
        },
    }
}

export type SquareVisual = ReturnType<typeof create_visual_square>
