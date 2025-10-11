export type SquareVisual = {
    clearIndicator: () => void
    setIndicator: (value: "selected" | "available-target" | "current-path" | "area") => void
}

export class VisualSquareCreator {
    create({x, y}: { x: number, y: number }) {
        const html_board = document.querySelector(".board")!

        const html_square = document.createElement("div")
        html_square.setAttribute("x", `${x}`)
        html_square.setAttribute("y", `${y}`)

        html_square.classList.add("board__square")
        html_board.appendChild(html_square)

        return {
            clearIndicator: () => delete html_square.dataset["indicator"],
            setIndicator: (value: "selected" | "available-target" | "current-path" | "area") => html_square.dataset["indicator"] = value
        }
    }
}
