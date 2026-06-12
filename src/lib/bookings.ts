export type BookingStatus = "pending" | "confirmed" | "declined" | "cancelled" | "completed";

export interface Booking {
  id: string;
  rideId: number;
  passengerName: string;
  passengerContact: string;
  pickup: string;
  dropoff: string;
  status: BookingStatus;
  createdAt: string;
  // timestamp when driver confirmed the booking (set when status becomes "confirmed")
  confirmedAt?: string;
  // whether passenger has submitted rating/feedback for this booking
  rated?: boolean;
}

const STORAGE_KEY = "ride_bookings_v1";

function readStorage(): Booking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Booking[];
  } catch (e) {
    return [];
  }
}

function writeStorage(bookings: Booking[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export function getBookings(): Booking[] {
  return readStorage();
}

export function getBookingsForPassenger(contact: string) {
  const all = readStorage();
  return all.filter((b) => b.passengerContact === contact);
}

export function getPendingBookings() {
  return readStorage().filter((b) => b.status === "pending");
}

export function saveBooking(data: Omit<Booking, "id" | "status" | "createdAt">) {
  const bookings = readStorage();
  const newBooking: Booking = {
    ...data,
    id: makeId(),
    status: "pending",
    createdAt: new Date().toISOString(),
    rated: false,
  };
  bookings.push(newBooking);
  writeStorage(bookings);
  return newBooking;
}

export function updateBookingStatus(id: string, status: BookingStatus) {
  const bookings = readStorage();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  bookings[idx].status = status;
  if (status === "confirmed") {
    bookings[idx].confirmedAt = new Date().toISOString();
  }
  writeStorage(bookings);
  return bookings[idx];
}

export function markBookingRated(id: string, rated = true) {
  const bookings = readStorage();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  bookings[idx].rated = rated;
  writeStorage(bookings);
  return bookings[idx];
}

export function isBookingActive(b: Booking) {
  if (b.status !== "confirmed") return false;
  if (!b.confirmedAt) return false;
  const confirmed = new Date(b.confirmedAt).getTime();
  const now = Date.now();
  // active for 10 minutes (600_000 ms) after confirmation
  return now - confirmed < 10 * 60 * 1000;
}

export function sweepCompleteBookings() {
  const bookings = readStorage();
  const now = Date.now();
  let changed = false;
  for (let i = 0; i < bookings.length; i++) {
    const b = bookings[i];
    if (b.status === "confirmed" && b.confirmedAt) {
      const confirmed = new Date(b.confirmedAt).getTime();
      if (now - confirmed >= 10 * 60 * 1000) {
        bookings[i] = { ...b, status: "completed" };
        changed = true;
      }
    }
  }
  if (changed) writeStorage(bookings);
  return changed;
}
