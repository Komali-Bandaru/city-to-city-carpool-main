export type Role = "passenger" | "driver";

export interface User {
  name: string;
  email: string;
  contact?: string;
  password?: string;
  role: Role;
}

const USERS_KEY = "mock_users_v1";
const TOKENS_KEY = "mock_tokens_v1";

function readUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function writeUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readTokens(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function writeTokens(map: Record<string, string>) {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(map));
}

function makeToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export function signup(user: User) {
  const users = readUsers();
  // require at least an email or contact
  if ((!user.email || user.email.trim() === "") && (!user.contact || user.contact.trim() === "")) {
    return { ok: false, error: "Provide either email or phone/contact" };
  }

  // Check by email or contact
  const normContact = (user.contact || "").replace(/\D/g, "");
  if (users.some((u) => (u.email && user.email && u.email === user.email) || ((u.contact || "").replace(/\D/g, "") === normContact && normContact))) {
    return { ok: false, error: "User already exists" };
  }

  // normalize contact (store digits only) to make phone login robust
  const stored = { ...user } as User;
  if (stored.contact) stored.contact = stored.contact.replace(/\D/g, "");
  users.push(stored);
  writeUsers(users);
  return { ok: true, user: stored };
}

export function login(identifier: string, password?: string) {
  // identifier may be an email or a phone/contact value. Support both.
  const users = readUsers();
  // try exact email match first
  let user = users.find((u) => u.email === identifier);
  if (!user) {
    // normalize identifier to digits and match against stored normalized contacts
    const norm = (identifier || "").replace(/\D/g, "");
    user = users.find((u) => (u.contact || "").replace(/\D/g, "") === norm);
  }
  if (!user) return { ok: false, error: "User not found" };

  // if password provided, check it; otherwise allow (otp)
  if (password && user.password && user.password !== password) return { ok: false, error: "Invalid credentials" };

  const token = makeToken();
  const tokens = readTokens();
  tokens[token] = user.email;
  writeTokens(tokens);
  return { ok: true, token, user };
}

export function getUserFromToken(token: string | null) {
  if (!token) return null;
  const tokens = readTokens();
  const email = tokens[token];
  if (!email) return null;
  const users = readUsers();
  return users.find((u) => u.email === email) || null;
}

export function logout(token: string) {
  const tokens = readTokens();
  delete tokens[token];
  writeTokens(tokens);
  return { ok: true };
}

// Dev helper: return all users (safe for local debug only)
export function getAllUsers() {
  return readUsers();
}
