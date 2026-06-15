// Admin identity for UI gating only. The backend is the real gate
// (admin_user? in ApplicationController, single-sourced from
// AdminAuthorizable::ADMIN_EMAIL); this just controls which admin-only UI shows.
export const ADMIN_EMAIL = 'dneves.junior@gmail.com'

// Mirrors the backend predicate (admin = a Therapist with the admin email).
export const isAdmin = (user) => user?.user_type === 'therapist' && user?.email === ADMIN_EMAIL
