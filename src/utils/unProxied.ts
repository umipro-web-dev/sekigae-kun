const unProxied = (value: unknown): unknown => JSON.parse(JSON.stringify(value))
export default unProxied