import {ACTION_TYPE, ActionType} from "core/battlegrid/creatures/ActionType";
import {create_html_element} from "web/utils/create_html_element";

const ACTION_DOT_DISPLAY_ORDER: Array<ActionType> = [
    ACTION_TYPE.STANDARD,
    ACTION_TYPE.MOVEMENT,
    ACTION_TYPE.MINOR,
    ACTION_TYPE.OPPORTUNITY,
    ACTION_TYPE.IMMEDIATE,
    ACTION_TYPE.FREE_ATTACK,
]

export const create_action_dots_visual = (container: HTMLElement) => {
    const dots_container = create_html_element("div", "creature__action-dots")
    container.insertBefore(dots_container, container.firstChild)

    const set_available_actions = (actions: Array<ActionType>) => {
        dots_container.replaceChildren()
        const available = new Set(actions)

        for (const action_type of ACTION_DOT_DISPLAY_ORDER) {
            if (!available.has(action_type)) continue

            const dot = create_html_element("span", `creature__action-dot creature__action-dot--${action_type}`)
            dots_container.appendChild(dot)
        }
    }

    return {set_available_actions}
}
