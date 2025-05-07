import {Position} from "../Position";

export type SquareVisual = {
    clearIndicator: () => void
    setIndicator: (value: "selected" | "available-target") => void
}

export type OnSquareClick = (params: { position: Position, visual_square: SquareVisual }) => void

export class VisualSquareCreator {
    onSquareClickHandlers: Array<OnSquareClick> = []

    create({x, y}: { x: number, y: number }) {
        const html_board = document.querySelector(".board")!
        const html_square = document.createElement("div")
        html_square.classList.add("board__square")
        html_board.appendChild(html_square)

        const visual_square = {
            clearIndicator: () => delete html_square.dataset["indicator"],
            setIndicator: (value: "selected" | "available-target") => html_square.dataset["indicator"] = value
        }

        html_square.addEventListener("click", () => this.onSquareClickHandlers.forEach(
            handler => handler({visual_square, position: {x, y}})
        ))

        return visual_square
    }

    addOnSquareClickEvent = (onSquareClick: OnSquareClick) => {
        this.onSquareClickHandlers.push(onSquareClick)
    }
}
