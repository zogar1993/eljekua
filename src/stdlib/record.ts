export const transform_record_values = <In, Out>(record: Record<string, In>, func: (value: In) => Out): Record<string, Out> =>
    transform_record_entries(record, ([key, value]) => [key, func(value)])

export const transform_record_keys = <T>(record: Record<string, T>, func: (key: string) => string): Record<string, T> =>
    transform_record_entries(record, ([key, value]) => [func(key), value])

export const transform_record_entries = <In, Out>(record: Record<string, In>, func: (_: [string, In]) => [string, Out]): Record<string, Out> =>
    Object.fromEntries(Object.entries(record).map(entry => func(entry)))