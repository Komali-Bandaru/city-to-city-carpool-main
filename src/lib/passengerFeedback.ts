export interface PassengerFeedback {
  id: string;
  bookingId: string;
  passengerContact: string;
  driverContact?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

const STORAGE_KEY = "passenger_feedbacks_v1";

function readStorage(): PassengerFeedback[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: PassengerFeedback[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export function addPassengerFeedback(bookingId: string, passengerContact: string, driverContact: string | undefined, rating: number, comment?: string) {
  const items = readStorage();
  const fb: PassengerFeedback = { id: makeId(), bookingId, passengerContact, driverContact, rating, comment, createdAt: new Date().toISOString() };
  items.push(fb);
  writeStorage(items);
  return fb;
}

export function getFeedbackForPassenger(contact?: string) {
  if (!contact) return [] as PassengerFeedback[];
  return readStorage().filter((f) => f.passengerContact === contact);
}

export function getPassengerFeedbackStats(contact?: string) {
  const all = getFeedbackForPassenger(contact);
  if (!all || all.length === 0) return { avgRating: 0, positivePercent: 0, negativePercent: 0, total: 0 };
  const total = all.length;
  const sum = all.reduce((s, f) => s + (f.rating || 0), 0);
  const avgRating = Math.round((sum / total) * 10) / 10;
  const positive = all.filter((f) => f.rating >= 4).length;
  const negative = all.filter((f) => f.rating <= 2).length;
  return { avgRating, positivePercent: Math.round((positive / total) * 100), negativePercent: Math.round((negative / total) * 100), total };
}

export function getFeedbackByBookingId(bookingId: string) {
  return readStorage().find((f) => f.bookingId === bookingId) || null;
}
