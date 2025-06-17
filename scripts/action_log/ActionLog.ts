export class ActionLog {
    add_new_action_log = (text: string) => {
        const action_log = document.querySelector("#action_log")!

        const action_log_entry = document.createElement("div");
        action_log_entry.textContent = text

        action_log.appendChild(action_log_entry)
    }
}