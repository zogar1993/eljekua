import {create_html_element} from "web/core/utils/create_html_element";

export type CreatureTeamValue = number | null

const TEAM_OPTIONS: Array<{ team: CreatureTeamValue, title: string, circle_class: string }> = [
    {team: null, title: "Neutral", circle_class: "visual-tests__team-circle--neutral"},
    {team: 1, title: "Team 1", circle_class: "visual-tests__team-circle--team-1"},
    {team: 2, title: "Team 2", circle_class: "visual-tests__team-circle--team-2"},
]

const teams_match = (left: CreatureTeamValue, right: CreatureTeamValue) => left === right

export const create_team_picker = ({value}: { value: CreatureTeamValue }) => {
    let selected_team: CreatureTeamValue = value ?? null

    const html_root = create_html_element("div", "visual-tests__team-picker")

    const refresh_selection = () => {
        html_root.querySelectorAll(".visual-tests__team-option").forEach(element => {
            if (!(element instanceof HTMLButtonElement)) return
            const team = element.dataset["team"]
            const option_team = team === "neutral" ? null : Number(team)
            element.classList.toggle(
                "visual-tests__team-option--selected",
                teams_match(option_team, selected_team),
            )
        })
    }

    for (const option of TEAM_OPTIONS) {
        const html_option = document.createElement("button")
        html_option.type = "button"
        html_option.className = "visual-tests__team-option"
        html_option.dataset["team"] = option.team === null ? "neutral" : String(option.team)
        html_option.title = option.title
        html_option.setAttribute("aria-label", option.title)

        const html_circle = create_html_element("span", `visual-tests__team-circle ${option.circle_class}`)
        html_option.append(html_circle)

        html_option.addEventListener("click", () => {
            selected_team = option.team
            refresh_selection()
        })

        html_root.append(html_option)
    }

    refresh_selection()

    const get_team = (): CreatureTeamValue => selected_team

    const set_team = (team: CreatureTeamValue) => {
        selected_team = team ?? null
        refresh_selection()
    }

    return {html_root, get_team, set_team}
}
