import axios from "axios"

/** Browser API client — sends session cookies on same-origin `/api/**` calls. */
export const apiClient = axios.create({
  withCredentials: true,
})
