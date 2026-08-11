import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {create_battle_grid_visual} from "web_components/battle_grid/BattleGridVisual";
import {create_visual_square} from "web_components/battle_grid/squares/SquareVisual";
import {
    Position,
    PositionFootprintOne, positions_of_same_footprint_equal,
    transform_position_to_f1,
    transform_positions_to_f1
} from "scripts/battlegrid/Position";
import {SquareHighlight} from "web_components/battle_grid/squares/SquareHighlight";
import {bound_minmax} from "stdlib/bound_minmax";
import {get_creature_defense} from "scripts/character_sheet/get_creature_defense";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {INSTRUCTION_TYPE} from "scripts/expressions/parser/instructions";
import {Expr} from "scripts/expressions/evaluator/types";
import {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import {
    AvailableInteractionsSelectPosition,
    PlayerTurnHandler
} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";
import {TurnState} from "scripts/battlegrid/player_turn_handler/TurnState";
import {
    ClickableCoordinate,
    get_position_by_coordinate,
    nullable_positions_equal
} from "web_components/battle_grid/coordinates/ClickableCoordinate";
import {GameEvents} from "scripts/events/GameEvents";
import {create_visual_creature} from "web_components/creature/CreatureVisual";
import {AnimationQueue} from "scripts/AnimationQueue";
import {OptionButtons} from "scripts/battlegrid/option_buttons/OptionButtons";
import {HitStatusButtons} from "scripts/battlegrid/hit_status_buttons/HitStatusButtons";

export const initialize_battle_grid_ui = ({battle_grid, player_turn_handler, turn_state, game_events, option_buttons, hit_status_buttons}: {
    battle_grid: BattleGrid,
    player_turn_handler: PlayerTurnHandler,
    turn_state: TurnState,
    game_events: GameEvents,
    option_buttons: OptionButtons,
    hit_status_buttons: HitStatusButtons
}) => {
    const {size} = battle_grid
    const click_overlay = create_battle_grid_visual({width: size.x, height: size.y})
    const board = battle_grid.board.map(row => row.map(({position: {x, y}}) => create_visual_square({x, y})))

    const get_square = ({x, y}: PositionFootprintOne) => {
        if (x < 0 || x >= size.x || y < 0 || y >= size.y)
            throw (`position {x:${x}, y:${y}} is out of the battle grid dimensions (width:${size.x}, height:${size.y})`)
        return board[y][x]
    }

    const get_squares = (position: Position) => {
        return transform_position_to_f1(position).map(p => get_square(p))
    }

    const set_highlight = ({positions, highlight}: { positions: Array<Position>, highlight: SquareHighlight }) => {
        positions.forEach(position => get_squares(position).forEach(square => square.set_highlight(highlight)))
    }


    let latest_position: Position | null = null
    //TODO AP3 this should be better on_hover
    const on_hover = ({coordinate}: { coordinate: ClickableCoordinate | null }) => {
        const selection_context = player_turn_handler.get_selection_context()
        if (selection_context?.type !== "position_select") return

        const position = coordinate &&
            get_position_by_coordinate({positions: selection_context.clickable, coordinate})

        if (nullable_positions_equal(latest_position, position)) return;
        latest_position = position

        const highlighted_positions = selection_context.highlighted.map(({position}) => position)

        for (const position of highlighted_positions) {
            get_square(position).set_interaction_status("none")
            get_square(position).set_highlight("none")
        }

        for (const creature of battle_grid.creatures)
            creature.events.is_untargeted.raise()

        player_turn_handler.set_selection_context({...selection_context, highlighted: []})

        if (position) {
            selection_context.on_hover(position)
            //show_attack_success_chance_if_needed({selection_context, evaluate_ast, turn_state})

            for (const p of transform_position_to_f1(position))
                get_square(p).set_interaction_status("hover")
        } else {
            for (const p of transform_positions_to_f1(selection_context.clickable))
                get_square(p).set_highlight("available-target")
        }
    }


    const on_click = ({coordinate}: { coordinate: ClickableCoordinate }) => {
        const selection_context = player_turn_handler.get_selection_context()
        if (selection_context?.type !== "position_select") return
        if (selection_context.target === null) return
        const position = get_position_by_coordinate({coordinate, positions: selection_context.clickable})
        if (position === null) return null;

        if (selection_context.target.type === "positions") {
            const path = selection_context.target.value
            if (!positions_of_same_footprint_equal(position, path[path.length - 1]))
                throw Error("position should be the end of the path")
        }

        turn_state.set_variable(selection_context.target_label,
            selection_context.target.type === "creatures" ? {
                type: selection_context.target.type,
                value: selection_context.target.value,
            } : {
                type: selection_context.target.type,
                value: selection_context.target.value,
                description: "target"
            })

        deselect()
    }

    const deselect = () => {
        const selection_context = player_turn_handler.get_selection_context()
        if (selection_context === null) return

        const position = turn_state.get_acting_creature().data.position
        get_squares(position).forEach((square) => square.set_highlight("none"))

        if (selection_context.type === "position_select") {
            for (const position of transform_positions_to_f1(selection_context.clickable))
                get_square(position).set_highlight("none")
            for (const position of selection_context.highlighted.map(({position}) => position))
                get_square(position).set_highlight("none")

            if (selection_context.target) {
                if (selection_context.target.type === "creatures") {
                    const creatures = selection_context.target.value

                    creatures.forEach(creature => creature.events.is_untargeted.raise())
                }
            }
        } else if (selection_context.type === "option_select")
            option_buttons.remove_options()
        else if (selection_context.type === "hit_status_select")
            hit_status_buttons.remove()

        player_turn_handler.set_selection_context(null)
    }

    function set_selected_indicator() {
        const position = turn_state.get_acting_creature().data.position
        set_highlight({positions: [position], highlight: "selected"})
    }


    click_overlay.addOnMouseMoveHandler(coordinate => {
        on_hover({coordinate})
    })

    click_overlay.addOnClickHandler(coordinate => {
        on_click({coordinate})
    })

    game_events.on_acting_creature_changed.add_handler(creature => {
        if (creature === null)
            deselect()
        else
            set_selected_indicator()
    })

    game_events.on_available_interactions_changed.add_handler((interactions) => {
        if (interactions.type === "position_select") {
            set_selected_indicator()

            set_highlight({positions: interactions.clickable, highlight: "available-target"})

            for (const {position, highlight} of interactions.highlighted)
                set_highlight({positions: [position], highlight})
        }
    })

    return {
        click_overlay,
        board,
        set_highlight,
    }
}

/* TODO activate success chance again
const show_attack_success_chance_if_needed = ({turn_state, selection_context, evaluate_ast}: {
    turn_state: TurnState,
    selection_context: AvailableInteractionsSelectPosition,
    evaluate_ast: (node: AstNode) => Expr
}) => {
    const next_instruction = turn_state.peek_instruction()
    const needs_roll = next_instruction.type === INSTRUCTION_TYPE.ATTACK_DICE_ROLL
    if (needs_roll && selection_context.target) {
        if (selection_context.target.type !== "creatures")
            throw Error("an attack roll needs to target creatures")

        const creatures = selection_context.target.value
        creatures.forEach(defender => {
            const attacker = next_instruction.attack
            const attack = EXPR.as_number(evaluate_ast(attacker))

            const defense_code = next_instruction.defense
            const defense = get_creature_defense({creature: defender, defense_code}).value

            const chance = bound_minmax(0, (attack + 20 - defense + 1) * 5, 100)

            defender.events.is_targeted.raise({attack, defense, chance})
        })
    }
}
 */