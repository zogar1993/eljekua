import {OnPositionClick} from "battlegrid/Position";

export type SquareVisual = {
    clearIndicator: () => void
    setIndicator: (value: "selected" | "available-target") => void
}

export class VisualSquareCreator {
    onSquareClickHandlers: Array<OnPositionClick> = []

    create({x, y}: { x: number, y: number }) {
        const html_board = document.querySelector(".board")!
        const html_square = document.createElement("div")
        html_square.classList.add("board__square")
        html_board.appendChild(html_square)

        html_square.addEventListener("click", () => this.onSquareClickHandlers.forEach(
            handler => handler({position: {x, y}})
        ))

        return {
            clearIndicator: () => delete html_square.dataset["indicator"],
            setIndicator: (value: "selected" | "available-target") => html_square.dataset["indicator"] = value
        }
    }

    addOnSquareClickEvent = (onClick: OnPositionClick) => {
        this.onSquareClickHandlers.push(onClick)
    }
}
