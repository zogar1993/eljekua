# Damage

## Application

- Damage is subtracted from the target's hit points.
- A missed attack cannot damage a minion.

## Types

- Damage, resistance, and vulnerability may each have a type (e.g. fire, cold).
- Resistance without a type applies to all damage types and to damage without a type.
- Vulnerability without a type applies to all damage types and to damage without a type.

## Stacking (single damage type)

- Multiple resistances to the same type: use only the highest.
- Multiple vulnerabilities to the same type: use only the highest.
- Resistance and vulnerability to the same type: subtract the lower value from the higher; apply the remainder (resistance if resistance is higher, vulnerability if vulnerability is higher).

## Multiple damage types

When incoming damage has more than one type, evaluate modifiers per type, then apply the **least favorable** result for the defender (full damage, reduced damage, or increased damage).

Examples:

- Fire + cold damage; resistance to fire only → full damage (no modifier applies).
- Fire + cold damage; resistance to fire, vulnerability to cold → vulnerability applies.
- Fire + cold damage; vulnerability to both fire and cold → only the highest vulnerability applies.

## Half damage

When a power deals half damage:

- Apply resistances and vulnerabilities first.
- Then halve the resulting damage, rounding down.
