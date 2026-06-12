import { getBookings } from "./bookings";
import { getRidesByDriverContact, getRides } from "./rides";

// Enhanced heuristic-based fraud detector for demo purposes.
// Flags drivers using multiple signals:
// - suspicious contact (repeating digits)
// - >=2 declined bookings across their rides
// - low average rating (< 3.0)
// - repeated/odd cab number patterns
// - suspicious driver name patterns

function normalizeContact(c?: string) {
  return (c || "").replace(/\D/g, "");
}

function isSuspiciousContact(contact?: string) {
  const norm = normalizeContact(contact);
  if (!norm) return false;
  // repeating digits
  if (/^(\d)\1{5,}$/.test(norm)) return true;
  // too short/too long
  if (norm.length < 7 || norm.length > 15) return true;
  return false;
}

function isSuspiciousCabNumber(cab?: string) {
  if (!cab) return false;
  // generic heuristic: too many repeated characters or obviously fake patterns
  if (/^(\w)\1{2,}$/.test(cab.replace(/\s+/g, ""))) return true;
  if (cab.length < 4) return true;
  return false;
}

function isSuspiciousName(name?: string) {
  if (!name) return false;
  const trimmed = name.trim();
  // names that are a single repeated letter or very short
  if (/^(\w)\1{1,}$/.test(trimmed)) return true;
  if (trimmed.length <= 1) return true;
  return false;
}

export function getFlagReasons(contact?: string) {
  const reasons: string[] = [];
  const norm = normalizeContact(contact);
  if (!norm) return reasons;

  if (isSuspiciousContact(contact)) reasons.push("Suspicious contact number");

  // declined bookings
  const rides = getRidesByDriverContact(contact || "");
  const bookings = getBookings();
  let declined = 0;
  for (const r of rides) {
    for (const b of bookings) {
      if (b.rideId === r.id && b.status === "declined") declined++;
      if (declined >= 2) break;
    }
    if (declined >= 2) break;
  }
  if (declined >= 2) reasons.push("Multiple declined bookings");

  // rating and feedbacks
  for (const r of rides) {
    if (r.avgRating !== undefined && r.avgRating < 3.0) {
      reasons.push(`Low average rating (${r.avgRating})`);
      break;
    }
    if (r.feedbacks && r.feedbacks.some((f) => f.comment && /rude|late|no-show|danger/i.test(f.comment))) {
      reasons.push("Negative passenger feedback");
      break;
    }
    if (r.cabNumber && isSuspiciousCabNumber(r.cabNumber)) {
      reasons.push("Suspicious cab number");
      break;
    }
    if (isSuspiciousName(r.driverName)) {
      reasons.push("Suspicious driver name");
      break;
    }
  }

  return reasons;
}

export function isDriverFlagged(contact?: string) {
  const reasons = getFlagReasons(contact);
  return reasons.length > 0;
}

export function getFlaggedDrivers() {
  const rides = getRides();
  const contacts = new Set<string>();
  for (const r of rides) {
    if (isDriverFlagged(r.driverContact)) contacts.add(r.driverContact || "");
  }
  return Array.from(contacts);
}
