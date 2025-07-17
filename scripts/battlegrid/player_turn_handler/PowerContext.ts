import {Consequence} from "tokenizer/transform_power_ir_into_vm_representation";
import {Creature} from "battlegrid/creatures/Creature";
import {Path, Position} from "battlegrid/Position";
import {assert} from "assert";
import {AstNodeNumberResolved} from "expression_parsers/token_to_node";

export class PowerContext {
    private variables: Map<string, VariableType> = new Map()
    private consequences: Array<Consequence> = []
    readonly power_name

    constructor(consequences: Array<Consequence>, power_name: string) {
        this.consequences = consequences
        this.power_name = power_name
    }

    set_variable = ({name, ...variable}: { name: string } & VariableType) => {
        this.variables.set(name, variable)
    }

    set_creature = ({name, value}: { name: string, value: Creature }) => {
        this.variables.set(name, {type: "creature", value})
    }

    set_creatures = ({name, value}: { name: string, value: Array<Creature> }) => {
        this.variables.set(name, {type: "creatures", value})
    }

    set_path = ({name, value}: { name: string, value: Path }) => {
        this.variables.set(name, {type: "path", value})
    }

    set_resolved_number = ({name, value}: { name: string, value: AstNodeNumberResolved }) => {
        this.variables.set(name, {type: "resolved_number", value})
    }

    get_creature = (name: string): Creature => {
        const variable = this.variables.get(name)
        if (!variable) throw Error(`variable ${name} not found in context`)
        if (variable.type !== "creature") throw Error(`variable ${name} expected to be a 'creature', but its a '${variable.type}'`)
        return variable.value
    }

    get_creatures = (name: string): Array<Creature> => {
        const variable = this.variables.get(name)
        if (!variable) throw Error(`variable ${name} not found in context`)
        if (variable.type === "creature") return [variable.value]
        if (variable.type === "creatures") return variable.value
        throw Error(`variable ${name} expected to be a 'creature' or 'creatures', but its a '${variable.type}'`)
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

type VariableType =
    VariableTypeCreature
    | VariableTypePosition
    | VariableTypePath
    | VariableTypeCreatures
    | VariableTypeResolvedNumber

type VariableTypeCreature = { type: "creature", value: Creature }
type VariableTypeCreatures = { type: "creatures", value: Array<Creature> }
type VariableTypePosition = { type: "position", value: Position }
type VariableTypePath = { type: "path", value: Path }
type VariableTypeResolvedNumber = { type: "resolved_number", value: AstNodeNumberResolved }
