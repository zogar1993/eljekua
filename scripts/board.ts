export class Board {
    BOARD_HEIGHT = 10
    BOARD_WIDTH = 10

    board: Array<Array<Cell>>
    get_cell = ({x, y}: {x: number, y: number}) => this.board[y][x]
    get_all_cells = () => this.board.flatMap(x => x)

    constructor() {
        const board = document.querySelector(".board")!

        this.board = Array.from({length: this.BOARD_HEIGHT}, (_, y) => {
                const row = document.createElement("div")
                row.classList.add("board__row")
                board.appendChild(row)

                return Array.from({length: this.BOARD_WIDTH}, (_, x) => {
                    const cell = document.createElement("div")
                    cell.classList.add("board__cell")
                    cell.dataset["x"] = `${x}`
                    cell.dataset["y"] = `${y}`
                    row.appendChild(cell)

                    return {
                        html_element: cell,
                        position: {x, y},
                        character: null,
                    }
                })
            }
        )
    }


    * get_area_burst({origin, radius}: {origin: Position, radius: number}) {
        const lower_x = Math.max(0, origin.x - radius)
        const upper_x = Math.min(this.BOARD_WIDTH - 1, origin.x + radius)
        const lower_y = Math.max(0, origin.y - radius)
        const upper_y = Math.min(this.BOARD_HEIGHT - 1, origin.y + radius)
        for (let x = lower_x; x <= upper_x; x++)
            for (let y = lower_y; y <= upper_y; y++)
                yield this.get_cell({x, y})
    }

    * get_move_area({origin, distance}: {origin: Position, distance: number}) {
        const lower_x = Math.max(0, origin.x - distance)
        const upper_x = Math.min(this.BOARD_WIDTH - 1, origin.x + distance)
        const lower_y = Math.max(0, origin.y - distance)
        const upper_y = Math.min(this.BOARD_HEIGHT - 1, origin.y + distance)
        for (let x = lower_x; x <= upper_x; x++)
            for (let y = lower_y; y <= upper_y; y++) {
                if (origin.x === x && origin.y === y) continue
                yield this.get_cell({x, y})
            }
    }

    clear_indicators() {
        this.get_all_cells().forEach(cell => {
            delete cell.html_element.dataset["indicator"]
        })
    }
}

export type Cell = {
    html_element: HTMLDivElement
    position: Position
    character: null | Character
}

export type Position = { x: number, y: number }

//TODO Type properly
export type Character = any



