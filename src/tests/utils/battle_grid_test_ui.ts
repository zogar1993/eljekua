import {BattleGridVisual} from "scripts/battlegrid/BattleGridVisual";


type OnMouseMoveHandler = Parameters<BattleGridVisual["addOnMouseMoveHandler"]>[0]
type OnClickHandler = Parameters<BattleGridVisual["addOnClickHandler"]>[0]

const battle_grid_reference = {
    on_mouse_move_handlers: [] as Array<OnMouseMoveHandler>,
    on_click_handlers: [] as Array<OnClickHandler>,
}

export const create_battle_grid_visual = (): BattleGridVisual => {
    return ({
        addOnMouseMoveHandler: (x: OnMouseMoveHandler) => battle_grid_reference.on_mouse_move_handlers.push(x),
        addOnClickHandler: (x: OnClickHandler) => battle_grid_reference.on_click_handlers.push(x)
    })
}

export const battle_grid_test_ui = {
    click: (position: {x: number, y: number}) => {
        const coordinate = {x: position.x * 2, y: position.y * 2}
        battle_grid_reference.on_mouse_move_handlers.forEach(handler => handler(coordinate))
        battle_grid_reference.on_click_handlers.forEach(handler => handler(coordinate))
    }
}