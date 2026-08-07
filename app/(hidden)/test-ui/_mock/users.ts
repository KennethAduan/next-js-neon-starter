export type UserStatus = "active" | "inactive" | "pending"
export type UserRole = "admin" | "editor" | "viewer"

export type User = {
  id: string
  name: string
  email: string
  status: UserStatus
  role: UserRole
  age: number
  createdAt: string
}

export const USER_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Pending", value: "pending" },
]

export const USER_ROLE_OPTIONS = [
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
]

export const MOCK_USERS: User[] = [
  { id: "1",  name: "Alice Johnson",    email: "alice@example.com",    status: "active",   role: "admin",  age: 34, createdAt: "2024-01-15" },
  { id: "2",  name: "Bob Smith",        email: "bob@example.com",      status: "inactive", role: "viewer", age: 28, createdAt: "2024-02-03" },
  { id: "3",  name: "Carol Williams",   email: "carol@example.com",    status: "pending",  role: "editor", age: 41, createdAt: "2024-02-20" },
  { id: "4",  name: "David Brown",      email: "david@example.com",    status: "active",   role: "viewer", age: 25, createdAt: "2024-03-08" },
  { id: "5",  name: "Eva Martinez",     email: "eva@example.com",      status: "active",   role: "editor", age: 37, createdAt: "2024-03-22" },
  { id: "6",  name: "Frank Lee",        email: "frank@example.com",    status: "inactive", role: "admin",  age: 52, createdAt: "2024-04-01" },
  { id: "7",  name: "Grace Kim",        email: "grace@example.com",    status: "active",   role: "viewer", age: 29, createdAt: "2024-04-15" },
  { id: "8",  name: "Henry Davis",      email: "henry@example.com",    status: "pending",  role: "editor", age: 44, createdAt: "2024-05-02" },
  { id: "9",  name: "Iris Chen",        email: "iris@example.com",     status: "active",   role: "admin",  age: 31, createdAt: "2024-05-18" },
  { id: "10", name: "Jack Wilson",      email: "jack@example.com",     status: "inactive", role: "viewer", age: 22, createdAt: "2024-06-05" },
  { id: "11", name: "Karen Taylor",     email: "karen@example.com",    status: "active",   role: "editor", age: 39, createdAt: "2024-06-20" },
  { id: "12", name: "Liam Anderson",    email: "liam@example.com",     status: "pending",  role: "viewer", age: 27, createdAt: "2024-07-09" },
  { id: "13", name: "Mia Thomas",       email: "mia@example.com",      status: "active",   role: "admin",  age: 46, createdAt: "2024-07-25" },
  { id: "14", name: "Noah Jackson",     email: "noah@example.com",     status: "inactive", role: "editor", age: 33, createdAt: "2024-08-12" },
  { id: "15", name: "Olivia White",     email: "olivia@example.com",   status: "active",   role: "viewer", age: 58, createdAt: "2024-08-28" },
  { id: "16", name: "Peter Harris",     email: "peter@example.com",    status: "active",   role: "editor", age: 21, createdAt: "2024-09-06" },
  { id: "17", name: "Quinn Martin",     email: "quinn@example.com",    status: "pending",  role: "admin",  age: 35, createdAt: "2024-09-19" },
  { id: "18", name: "Rachel Garcia",    email: "rachel@example.com",   status: "active",   role: "viewer", age: 43, createdAt: "2024-10-03" },
  { id: "19", name: "Samuel Robinson",  email: "samuel@example.com",   status: "inactive", role: "editor", age: 30, createdAt: "2024-10-17" },
  { id: "20", name: "Tara Clark",       email: "tara@example.com",     status: "active",   role: "admin",  age: 49, createdAt: "2024-11-01" },
  { id: "21", name: "Uma Rodriguez",    email: "uma@example.com",      status: "pending",  role: "viewer", age: 26, createdAt: "2024-11-14" },
  { id: "22", name: "Victor Lewis",     email: "victor@example.com",   status: "active",   role: "editor", age: 38, createdAt: "2024-11-28" },
  { id: "23", name: "Wendy Lee",        email: "wendy@example.com",    status: "inactive", role: "admin",  age: 55, createdAt: "2024-12-07" },
  { id: "24", name: "Xander Walker",    email: "xander@example.com",   status: "active",   role: "viewer", age: 24, createdAt: "2024-12-20" },
  { id: "25", name: "Yara Hall",        email: "yara@example.com",     status: "active",   role: "editor", age: 32, createdAt: "2025-01-08" },
  { id: "26", name: "Zane Allen",       email: "zane@example.com",     status: "pending",  role: "viewer", age: 47, createdAt: "2025-01-22" },
  { id: "27", name: "Amy Young",        email: "amy@example.com",      status: "active",   role: "admin",  age: 36, createdAt: "2025-02-05" },
  { id: "28", name: "Brian King",       email: "brian@example.com",    status: "inactive", role: "editor", age: 61, createdAt: "2025-02-18" },
  { id: "29", name: "Chloe Wright",     email: "chloe@example.com",    status: "active",   role: "viewer", age: 23, createdAt: "2025-03-03" },
  { id: "30", name: "Derek Scott",      email: "derek@example.com",    status: "active",   role: "editor", age: 40, createdAt: "2025-03-17" },
]
