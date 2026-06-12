export interface UnreadCounts {
  passenger: number;
  driver: number;
}

function key(bookingId: string) {
  return `chat_unread_${bookingId}`;
}

export function getUnreadCounts(bookingId: string): UnreadCounts {
  try {
    const raw = localStorage.getItem(key(bookingId));
    if (!raw) return { passenger: 0, driver: 0 };
    return JSON.parse(raw) as UnreadCounts;
  } catch {
    return { passenger: 0, driver: 0 };
  }
}

export function setUnreadCounts(bookingId: string, counts: UnreadCounts) {
  localStorage.setItem(key(bookingId), JSON.stringify(counts));
}

export function incrementUnreadForRole(bookingId: string, role: "passenger" | "driver") {
  const cur = getUnreadCounts(bookingId);
  const next = { ...cur, [role]: (cur[role] || 0) + 1 };
  setUnreadCounts(bookingId, next);
}

export function clearUnreadForRole(bookingId: string, role: "passenger" | "driver") {
  const cur = getUnreadCounts(bookingId);
  const next = { ...cur, [role]: 0 };
  setUnreadCounts(bookingId, next);
}

export function clearAllUnread(bookingId: string) {
  setUnreadCounts(bookingId, { passenger: 0, driver: 0 });
}

// append a system message to the chat for booking; does not increment writer's unread, increments other role unread
export function appendSystemMessage(bookingId: string, text: string, notifyRole: "passenger" | "driver") {
  try {
    const keyMsg = `chat_${bookingId}`;
    const raw = localStorage.getItem(keyMsg);
    const msgs = raw ? JSON.parse(raw) : [];
    const m = { sender: "System", senderRole: "system", text, ts: new Date().toISOString() };
    msgs.push(m);
    localStorage.setItem(keyMsg, JSON.stringify(msgs));
    // increment unread for the role to notify
    incrementUnreadForRole(bookingId, notifyRole);
  } catch {
    // ignore
  }
}

export function appendSystemMessageNoNotify(bookingId: string, text: string) {
  try {
    const keyMsg = `chat_${bookingId}`;
    const raw = localStorage.getItem(keyMsg);
    const msgs = raw ? JSON.parse(raw) : [];
    const m = { sender: "System", senderRole: "system", text, ts: new Date().toISOString() };
    msgs.push(m);
    localStorage.setItem(keyMsg, JSON.stringify(msgs));
  } catch {
    // ignore
  }
}
