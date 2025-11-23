export const is_numeric_character = (char: string) => /^\d$/.test(char)
export const is_non_numeric_character = (char: string) => /^[(a-z._]$/.test(char)
export const is_text_character = (char: string) => /^[a-z_]$/.test(char)

export const is_numeric_text = (text: string) => /^\d+$/.test(text)
export const is_plain_text = (text: string) => /^[a-z_]+$/.test(text)
