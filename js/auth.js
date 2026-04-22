// ─── Auth Helpers (plain JS, no JSX) ─────────────────────────────────────────

const ADMIN_EMAIL = 'aster@asterone.xyz';

function getUsers() {
  try { return JSON.parse(localStorage.getItem('petunias-users')) || []; } catch { return []; }
}
function saveUsers(users) { localStorage.setItem('petunias-users', JSON.stringify(users)); }

function getSession() {
  try { return JSON.parse(localStorage.getItem('petunias-session')); } catch { return null; }
}
function saveSession(user) { localStorage.setItem('petunias-session', JSON.stringify(user)); }
function clearSession() { localStorage.removeItem('petunias-session'); }

function hashPass(str) {
  // simple obfuscation (client-only app, no real security needed)
  return btoa(unescape(encodeURIComponent(str + '_petunias_salt')));
}

function registerUser({ email, nombre, password }) {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: 'Ya existe una cuenta con ese email.' };
  }
  const user = {
    id: Date.now(),
    email: email.toLowerCase().trim(),
    nombre: nombre.trim(),
    password: hashPass(password),
    isAdmin: email.toLowerCase().trim() === ADMIN_EMAIL,
    avatar: null,
    linkedPlayerId: null,
    createdAt: Date.now()
  };
  saveUsers([...users, user]);
  const safeUser = { ...user }; delete safeUser.password;
  saveSession(safeUser);
  return { user: safeUser };
}

function loginUser({ email, password }) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) return { error: 'No existe una cuenta con ese email.' };
  if (user.password !== hashPass(password)) return { error: 'Contraseña incorrecta.' };
  const safeUser = { ...user }; delete safeUser.password;
  // refresh admin status in case email matches
  safeUser.isAdmin = safeUser.email === ADMIN_EMAIL;
  saveSession(safeUser);
  return { user: safeUser };
}

function updateUserProfile(userId, updates) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
  const safeUser = { ...users[idx] }; delete safeUser.password;
  saveSession(safeUser);
  return safeUser;
}

function deleteUserById(userId) {
  saveUsers(getUsers().filter(u => u.id !== userId));
}

function setUserCoach(userId, isCoach) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  users[idx].isCoach = !!isCoach;
  saveUsers(users);
  // If editing the currently logged-in user, refresh session
  const sess = getSession();
  if (sess && sess.id === userId) {
    sess.isCoach = !!isCoach;
    saveSession(sess);
  }
  return users[idx];
}

function getAllUsers() {
  return getUsers().map(u => { const s = {...u}; delete s.password; return s; });
}

// Ensure admin account always exists
function ensureAdminExists() {
  const users = getUsers();
  if (!users.find(u => u.email === ADMIN_EMAIL)) {
    // create admin with default password, they can change it
    const admin = {
      id: 1, email: ADMIN_EMAIL, nombre: 'Admin',
      password: hashPass('petunias2025'),
      isAdmin: true, avatar: null, linkedPlayerId: null, createdAt: Date.now()
    };
    saveUsers([...users, admin]);
  }
}

ensureAdminExists();

Object.assign(window, {
  ADMIN_EMAIL, getUsers, getSession, saveSession, clearSession,
  registerUser, loginUser, updateUserProfile, deleteUserById, getAllUsers,
  setUserCoach,
});
