export type SquareVisual = {
    setIndicator: (value: "selected" | "available-target" | "current-path" | null) => void
}

export const create_visual_square = ({x, y}: { x: number, y: number }) => {
    const html_board = document.querySelector(".board")!

    const html_square = document.createElement("div")
    html_square.setAttribute("x", `${x}`)
    html_square.setAttribute("y", `${y}`)

    html_square.classList.add("board__square")
    html_board.appendChild(html_square)

    return {
        setIndicator: (value: "selected" | "available-target" | "current-path" | null) => {
            if (value === null)
                delete html_square.dataset["indicator"]
            else
                html_square.dataset["indicator"] = value
        }
    }
}
