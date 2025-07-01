import {OnPositionEvent} from "battlegrid/Position";

export type SquareVisual = {
    clearIndicator: () => void
    setIndicator: (value: "selected" | "available-target") => void
}

export class VisualSquareCreator {
    onClickHandlers: Array<OnPositionEvent> = []
    onHoverHandlers: Array<OnPositionEvent> = []

    create({x, y}: { x: number, y: number }) {
        const html_board = document.querySelector(".board")!
        const html_square = document.createElement("div")
        html_square.classList.add("board__square")
        html_board.appendChild(html_square)

        html_square.addEventListener("click", () => this.onClickHandlers.forEach(
            handler => handler({position: {x, y}})
        ))

        html_square.addEventListener("mouseenter", () => this.onHoverHandlers.forEach(
            handler => handler({position: {x, y}})
        ))

        return {
            clearIndicator: () => delete html_square.dataset["indicator"],
            setIndicator: (value: "selected" | "available-target") => html_square.dataset["indicator"] = value
        }
    }

    addOnSquareClickEvent = (onClick: OnPositionEvent) => {
        this.onClickHandlers.push(onClick)
    }

    addOnSquareHoverEvent = (onHover: OnPositionEvent) => {
        this.onHoverHandlers.push(onHover)
    }
}
