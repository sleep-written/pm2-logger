// Para compatibilidad con predicates que devuelven mierda pero a nadie le importa
export type EventCallback<A extends unknown[]> = (...a: A) => unknown | Promise<unknown>;