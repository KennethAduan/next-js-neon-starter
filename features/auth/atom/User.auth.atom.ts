import { atomWithStorage } from "jotai/utils"
import { SyncStorage } from "jotai/vanilla/utils/atomWithStorage"
import { jotaiStorage } from "@/lib/jotai.storage"

import { COLLECTIONS, type UserWithoutPassword } from "@/lib/schema"
import { encryptKeyName } from "@/lib/encrypt-key-name"

const ATOM_KEY = {
  USER: encryptKeyName(COLLECTIONS.USERS),
}
export const userAuthAtom = atomWithStorage(
  ATOM_KEY.USER,
  null as UserWithoutPassword | null,
  jotaiStorage as SyncStorage<UserWithoutPassword | null>
)
