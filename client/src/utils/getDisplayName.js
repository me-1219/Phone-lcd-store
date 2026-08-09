/**
 * Backend user records use "username", not "name" (confirmed from the
 * actual DB record) — this fallback keeps every display spot working
 * regardless of which field the backend actually returns, so profile
 * name/avatar initials never silently render blank.
 */
export const getDisplayName = (user) => user?.name || user?.username || "there";

export const getInitials = (user) => {
  const display = getDisplayName(user);
  return display === "there" ? "?" : display.slice(0, 2).toUpperCase();
};