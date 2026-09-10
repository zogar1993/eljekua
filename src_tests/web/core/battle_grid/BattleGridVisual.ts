import type {ClickableCoordinate} from "web/core/battle_grid/coordinates/ClickableCoordinate";
import {coordinates_equal} from "web/core/battle_grid/coordinates/ClickableCoordinate";

export const create_battle_grid_visual = ({width, height}: { width: number, height: number }): BattleGridVisual => {
    const html_board = document.querySelector(".board")! as HTMLDivElement

    const get_click_coordinate_from_mouse_event = (e: MouseEvent): ClickableCoordinate => {
        const rect = html_board.getBoundingClientRect();
        const BORDER_WIDTH = 1

        const BATTLE_GRID_PIXEL_WIDTH = rect.width - BORDER_WIDTH * 2
        const COORDINATE_PIXEL_WIDTH = BATTLE_GRID_PIXEL_WIDTH / (width * 2)
        const coordinate_x = Math.floor((e.clientX - rect.left) / COORDINATE_PIXEL_WIDTH);

        const BATTLE_GRID_PIXEL_HEIGHT = rect.width - BORDER_WIDTH * 2
        const COORDINATE_PIXEL_HEIGHT = BATTLE_GRID_PIXEL_HEIGHT / (height * 2)
        const coordinate_y = Math.floor((e.clientY - rect.top) / COORDINATE_PIXEL_HEIGHT);

        return {
            x: Math.min(Math.max(0, coordinate_x), (width * 2) - 1),
            y: Math.min(Math.max(0, coordinate_y), (height * 2) - 1)
        }
    }


    const onMouseMoveHandlers: Array<(coordinate: ClickableCoordinate | null) => void> = []
    const onClickHandlers: Array<(coordinate: ClickableCoordinate) => void> = []

    html_board.addEventListener("click", (e: MouseEvent) => {
        const coordinate = get_click_coordinate_from_mouse_event(e)
        onClickHandlers.forEach(handler => handler(coordinate))
    });

    let latest_coordinate: ClickableCoordinate | null = null

    html_board.addEventListener('mousemove', (e: MouseEvent) => {
        const coordinate = get_click_coordinate_from_mouse_event(e)
        if (latest_coordinate === null || !coordinates_equal(coordinate, latest_coordinate)) {
            latest_coordinate = coordinate
            onMouseMoveHandlers.forEach(handler => handler(coordinate))
        }
    });

    html_board.addEventListener('mouseleave', () => {
        latest_coordinate = null
        onMouseMoveHandlers.forEach(handler => handler(null))
    })

    return {
        addOnMouseMoveHandler: (handler: (coordinate: ClickableCoordinate | null) => void) => {
            onMouseMoveHandlers.push(handler)
        },
        addOnClickHandler: (handler: (coordinate: ClickableCoordinate) => void) => {
            onClickHandlers.push(handler)
        }
    }
}

type ClickableCoordinateFunction = (coordinate: ClickableCoordinate) => void
type ClickableCoordinateOrNullFunction = (coordinate: ClickableCoordinate | null) => void

export type BattleGridVisual = {
    addOnMouseMoveHandler: (handler: ClickableCoordinateOrNullFunction) => void
    addOnClickHandler: (handler: ClickableCoordinateFunction) => void
}
