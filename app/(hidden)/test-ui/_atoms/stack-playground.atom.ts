import { atom } from "jotai"

/** UI-only shared state. Never use this for database/server data. */
export const stackPlaygroundCountAtom = atom(0)
