import {Consequence} from "tokenizer/transform_power_ir_into_vm_representation";
import {Creature} from "battlegrid/creatures/Creature";
import {Path, Position} from "battlegrid/Position";
import {assert} from "assert";

export class ActivePowerContext {
    private variables: Map<string, ActivePowerVariable> = new Map()
    private consequences: Array<Consequence> = []

    constructor(consequences: Array<Consequence>) {
        this.consequences = consequences
    }

    set_variable = ({name, ...variable}: { name: string } & ActivePowerVariable) => {
        this.variables.set(name, variable)
    }

    get_creature = (name: string): Creature => {
        const variable = this.variables.get(name)
        if (!variable) throw Error(`variable ${name} not found in context`)
        if (variable.type !== "creature") throw Error(`variable ${name} expected to be a 'creature', but its a '${variable.type}'`)
        return variable.value
    }

    get_position = (name: string): Position => {
        const variable = this.variables.get(name)
        if (!variable) throw Error(`variable ${name} not found in context`)
        if (variable.type !== "position") throw Error(`variable ${name} expected to be a 'position', but its a '${variable.type}'`)
        return variable.value
    }

    get_path = (name: string): Path => {
        const variable = this.variables.get(name)
        if (!variable) throw Error(`variable ${name} not found in context`)
        if (variable.type !== "path") throw Error(`variable ${name} expected to be a 'path', but its a '${variable.type}'`)
        return variable.value
    }

    next_consequence = (): Consequence => {
        assert(this.consequences.length > 0, () => "no consequences left when calling next consequence")
        const [next, ...consequences] = this.consequences
        this.consequences = consequences
        return next
    }

    has_consequences = (): boolean => {
        return this.consequences.length > 0
    }

    has_variable = (name: string): boolean => {
        return this.variables.has(name)
    }

    add_consequences = (consequences: Array<Consequence>): void => {
        this.consequences = [...consequences, ...this.consequences]
    }

    get_variable = (name: string) => {
        const variable = this.variables.get(name)
        if (!variable) throw Error(`variable ${name} not found in context`)
        return variable
    }
}

type ActivePowerVariable = VariableTypeCreature | VariableTypePosition | VariableTypePath

type VariableTypeCreature = { type: "creature", value: Creature }
type VariableTypePosition = { type: "position", value: Position }
type VariableTypePath = { type: "path", value: Path }
