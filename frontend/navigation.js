// navigation.js - SafetyVision RBAC + Auth + Seed + Toast
// v2.0

(function () {
  "use strict";

  const USERS_KEY     = "sv_users";
  const INCIDENTS_KEY = "sv_incidents";
  const CAMERAS_KEY   = "sv_cameras";
  const AUTH_TOKEN_KEY = "sv_auth_token";
  const LOGIN_PASSWORD_KEY = "sv_login_password";
  const DEMO_PASSWORDS = {
    admin: "admin123",
    operator: "op123",
    operator2: "op456",
  };
  const API_BASE = (() => {
    const custom = window.SAFETYVISION_API_BASE || localStorage.getItem("sv_api_base");
    if (custom) return String(custom).replace(/\/+$/, "");
    const host = window.location.hostname || "localhost";
    return `http://${host}:8000`;
  })();

  function getToken() {
    return sessionStorage.getItem(AUTH_TOKEN_KEY) || "";
  }
  function setToken(token) {
    if (token) {
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } else {
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }
  function authHeader() {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
  }
  async function apiFetch(path, options = {}) {
    const opts = { ...options };
    opts.headers = { ...(options.headers || {}), ...authHeader() };
    const m = String(opts.method || "GET").toUpperCase();
    if (opts.body && !(opts.body instanceof FormData) && !opts.headers["Content-Type"] && m !== "GET") {
      opts.headers["Content-Type"] = "application/json";
    }
    return fetch(API_BASE + path, opts);
  }

  // 1. Demo seed
  function initUsersIfEmpty() {
    if (localStorage.getItem(USERS_KEY)) return;
    const demoUsers = [
      { id: "u1", username: "admin",    fullName: "Almas Bekov",       role: "admin",    email: "admin@safety.kz", createdAt: "2024-01-10" },
      { id: "u2", username: "operator", fullName: "Dina Seitkali",     role: "operator", email: "dina@safety.kz",  createdAt: "2024-02-15" },
      { id: "u3", username: "operator2",fullName: "Serik Zhaksybek",   role: "operator", email: "serik@safety.kz", createdAt: "2024-03-20" },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers));
  }

  function initIncidentsIfEmpty() {
    if (localStorage.getItem(INCIDENTS_KEY)) return;
    const now = Date.now();
    const day = 86400000;
    const demoIncidents = [
      { id: "INC-0012", type: "No Helmet",      location: "Warehouse B / CAM-03",      severity: "high",   status: "Open",         camera: "CAM-03", createdAt: new Date(now - 2*60000).toISOString(),            date: fmt(now - 2*60000),            note: "" },
      { id: "INC-0011", type: "Safety Warning", location: "Loading Zone 1 / CAM-07",   severity: "medium", status: "Investigating", camera: "CAM-07", createdAt: new Date(now - 5*60000).toISOString(),            date: fmt(now - 5*60000),            note: "" },
      { id: "INC-0010", type: "No Vest",        location: "Assembly Line 2 / CAM-08",  severity: "high",   status: "Open",         camera: "CAM-08", createdAt: new Date(now - 1*3600000).toISOString(),          date: fmt(now - 1*3600000),          note: "" },
      { id: "INC-0009", type: "Zone Intrusion", location: "Perimeter / CAM-21",        severity: "medium", status: "Resolved",     camera: "CAM-21", createdAt: new Date(now - 3*3600000).toISOString(),          date: fmt(now - 3*3600000),          note: "Checked by operator" },
      { id: "INC-0008", type: "No Helmet",      location: "Sector 4 / CAM-12",         severity: "high",   status: "Resolved",     camera: "CAM-12", createdAt: new Date(now - 1*day).toISOString(),              date: fmt(now - 1*day),              note: "Worker warned" },
      { id: "INC-0007", type: "Person Detected",location: "Entrance / CAM-01",         severity: "low",    status: "Resolved",     camera: "CAM-01", createdAt: new Date(now - 1*day - 2*3600000).toISOString(),  date: fmt(now - 1*day - 2*3600000),  note: "" },
      { id: "INC-0006", type: "Safety Warning", location: "Warehouse A / CAM-03",      severity: "medium", status: "Resolved",     camera: "CAM-03", createdAt: new Date(now - 2*day).toISOString(),              date: fmt(now - 2*day),              note: "" },
      { id: "INC-0005", type: "No Vest",        location: "Assembly Line 3 / CAM-09",  severity: "high",   status: "Resolved",     camera: "CAM-09", createdAt: new Date(now - 3*day).toISOString(),              date: fmt(now - 3*day),              note: "" },
      { id: "INC-0004", type: "No Helmet",      location: "Loading Zone 2 / CAM-11",   severity: "high",   status: "Resolved",     camera: "CAM-11", createdAt: new Date(now - 4*day).toISOString(),              date: fmt(now - 4*day),              note: "" },
      { id: "INC-0003", type: "Zone Intrusion", location: "Perimeter / CAM-21",        severity: "low",    status: "Resolved",     camera: "CAM-21", createdAt: new Date(now - 5*day).toISOString(),              date: fmt(now - 5*day),              note: "" },
      { id: "INC-0002", type: "Safety Warning", location: "Sector 4 / CAM-12",         severity: "medium", status: "Resolved",     camera: "CAM-12", createdAt: new Date(now - 6*day).toISOString(),              date: fmt(now - 6*day),              note: "" },
      { id: "INC-0001", type: "No Helmet",      location: "Warehouse B / CAM-03",      severity: "high",   status: "Resolved",     camera: "CAM-03", createdAt: new Date(now - 7*day).toISOString(),              date: fmt(now - 7*day),              note: "" },
    ];
    localStorage.setItem(INCIDENTS_KEY, JSON.stringify(demoIncidents));
  }

  function initCamerasIfEmpty() {
    if (localStorage.getItem(CAMERAS_KEY)) return;
    const demoCameras = [
      { id: "CAM-01", name: "Entrance",          location: "Main Entrance",      status: "online",  lastIncident: "2 days ago" },
      { id: "CAM-03", name: "Warehouse B / 03",  location: "Warehouse B",        status: "alert",   lastIncident: "2 min ago" },
      { id: "CAM-07", name: "Loading Zone 1",    location: "Loading Zone 1",     status: "warning", lastIncident: "5 min ago" },
      { id: "CAM-08", name: "Assembly Line 2",   location: "Assembly Line 2",    status: "online",  lastIncident: "1 hour ago" },
      { id: "CAM-09", name: "Assembly Line 3",   location: "Assembly Line 3",    status: "online",  lastIncident: "3 days ago" },
      { id: "CAM-11", name: "Loading Zone 2",    location: "Loading Zone 2",     status: "online",  lastIncident: "4 days ago" },
      { id: "CAM-12", name: "Sector 4 / CAM-12", location: "Sector 4",           status: "online",  lastIncident: "1 day ago" },
      { id: "CAM-21", name: "Perimeter East",    location: "Perimeter",          status: "offline", lastIncident: "5 days ago" },
    ];
    localStorage.setItem(CAMERAS_KEY, JSON.stringify(demoCameras));
  }

  function fmt(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString("kk-KZ") + " " + d.toLocaleTimeString("kk-KZ", { hour: "2-digit", minute: "2-digit" });
  }

  function _isMojibake(v) {
    return /[РЃ]/.test(String(v || ""));
  }

  function repairMojibakeData() {
    try {
      const incidents = getIncidents().map((x) => ({
        ...x,
        type: _isMojibake(x.type) ? "No Helmet" : (x.type || "Incident"),
        location: _isMojibake(x.location) ? `Camera ${x.camera || ""}`.trim() : (x.location || ""),
        note: _isMojibake(x.note) ? "" : (x.note || ""),
      }));
      saveIncidents(incidents);
    } catch {}

    try {
      const users = getUsers().map((u) => ({
        ...u,
        fullName: _isMojibake(u.fullName) ? (u.username || "User") : (u.fullName || u.username || "User"),
      }));
      saveUsers(users);
    } catch {}

    try {
      const cams = JSON.parse(localStorage.getItem(CAMERAS_KEY) || "[]").map((c) => ({
        ...c,
        name: _isMojibake(c.name) ? (c.id || "Camera") : (c.name || c.id || "Camera"),
        location: _isMojibake(c.location) ? "" : (c.location || ""),
        lastIncident: _isMojibake(c.lastIncident) ? "" : (c.lastIncident || ""),
      }));
      localStorage.setItem(CAMERAS_KEY, JSON.stringify(cams));
    } catch {}

    try {
      const acts = getActivities().map((a) => ({
        ...a,
        title: _isMojibake(a.title) ? "Оқиға тіркелді" : (a.title || "Оқиға"),
        desc: _isMojibake(a.desc) ? "" : (a.desc || ""),
      }));
      saveActivities(acts);
    } catch {}
  }

  async function hydrateFromBackend() {
    if (!getToken()) return false;
    try {
      const r = await apiFetch("/api/bootstrap");
      if (r.status === 401) {
        setToken("");
        sessionStorage.clear();
        return false;
      }
      if (!r.ok) return false;
      const data = await r.json();
      if (!data?.ok) return false;

      if (data.user) setSessionUser(data.user);
      if (Array.isArray(data.incidents)) localStorage.setItem(INCIDENTS_KEY, JSON.stringify(data.incidents));
      if (Array.isArray(data.cameras)) localStorage.setItem(CAMERAS_KEY, JSON.stringify(data.cameras));

      if (Array.isArray(data.users)) {
        localStorage.setItem(USERS_KEY, JSON.stringify(data.users));
      } else if (data.user) {
        const users = getUsers();
        const idx = users.findIndex(u => u.id === data.user.id);
        if (idx >= 0) users[idx] = { ...users[idx], ...data.user };
        else users.push(data.user);
        saveUsers(users);
      }
      return true;
    } catch {
      return false;
    }
  }

  // 2. CRUD helpers - incidents
  function getIncidents() {
    try { return JSON.parse(localStorage.getItem(INCIDENTS_KEY) || "[]"); } catch { return []; }
  }
  function saveIncidents(arr) {
    localStorage.setItem(INCIDENTS_KEY, JSON.stringify(arr));
  }
  function addIncident(data) {
    const arr = getIncidents();
    const id = data.id || ("INC-" + Date.now());
    const now = new Date();
    const item = { id, ...data, createdAt: now.toISOString(), date: fmt(now.getTime()), status: data.status || "Open", note: data.note || "" };
    arr.unshift(item);
    saveIncidents(arr);
    apiFetch("/api/incidents", { method: "POST", body: JSON.stringify(item) }).catch(() => {});
    addActivity("Оқиға қосылды", `${id} • ${item.type || "Оқиға"} — ${item.location || ""}`, item.severity === "high" ? "error" : "info");
    return item;
  }
  function updateIncident(id, patch) {
    const before = getIncidents().find(x => x.id === id);
    const arr = getIncidents().map(x => x.id === id ? { ...x, ...patch } : x);
    saveIncidents(arr);
    apiFetch(`/api/incidents/${id}`, { method: "PATCH", body: JSON.stringify(patch) }).catch(() => {});
    const st = patch.status || before?.status || "";
    const title = st === "Resolved" ? "Оқиға шешілді" : st === "Investigating" ? "Тексерілуде" : "Оқиға жаңартылды";
    const level = st === "Resolved" ? "success" : "info";
    addActivity(title, `${id} • ${patch.note || st || "Жаңарту"}`, level);
  }
  function deleteIncident(id) {
    const before = getIncidents().find(x => x.id === id);
    saveIncidents(getIncidents().filter(x => x.id !== id));
    apiFetch(`/api/incidents/${id}`, { method: "DELETE" }).catch(() => {});
    addActivity("Оқиға жойылды", `${id} • ${before?.type || "Оқиға"}`, "warning");
  }

  // 3. CRUD helpers - users
  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
  }
  function saveUsers(arr) { localStorage.setItem(USERS_KEY, JSON.stringify(arr)); }
  function addUser(data) {
    const arr = getUsers();
    if (arr.find(u => u.username === data.username)) return { ok: false, message: "Бұл логин бос емес" };

    const tempId = "u" + Date.now();
    const localUser = { id: tempId, ...data, createdAt: new Date().toLocaleDateString("kk-KZ") };
    arr.push(localUser);
    saveUsers(arr);

    apiFetch("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then(async r => {
        const d = await r.json().catch(() => ({}));
        if (r.ok && d?.ok && d.user) {
          const users = getUsers().map(u => u.id === tempId ? d.user : u);
          saveUsers(users);
        } else {
          saveUsers(getUsers().filter(u => u.id !== tempId));
          showToast(d?.message || "Пайдаланушыны сақтау қатесі", "error");
        }
      })
      .catch(() => {
        saveUsers(getUsers().filter(u => u.id !== tempId));
        showToast("Сервермен байланыс жоқ", "error");
      });

    return { ok: true };
  }

  function updateUser(id, patch) {
    const prev = getUsers();
    saveUsers(prev.map(u => u.id === id ? { ...u, ...patch } : u));

    apiFetch(`/api/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    })
      .then(async r => {
        const d = await r.json().catch(() => ({}));
        if (r.ok && d?.ok && d.user) {
          saveUsers(getUsers().map(u => u.id === id ? d.user : u));
        } else {
          saveUsers(prev);
          showToast(d?.message || "Пайдаланушыны жаңарту қатесі", "error");
        }
      })
      .catch(() => {
        saveUsers(prev);
        showToast("Сервермен байланыс жоқ", "error");
      });
  }

  async function changePassword(userId, oldPassword, newPassword) {
    const r = await apiFetch(`/api/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ password: newPassword, oldPassword }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d?.ok) return { ok: false, message: d?.message || "Құпия сөз өзгермеді" };
    if (d.user) saveUsers(getUsers().map(u => u.id === userId ? d.user : u));
    return { ok: true };
  }

  function deleteUser(id) {
    const prev = getUsers();
    saveUsers(prev.filter(u => u.id !== id));
    apiFetch(`/api/users/${id}`, { method: "DELETE" })
      .then(async r => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok || !d?.ok) {
          saveUsers(prev);
          showToast(d?.message || "Пайдаланушыны жою қатесі", "error");
        }
      })
      .catch(() => {
        saveUsers(prev);
        showToast("Сервермен байланыс жоқ", "error");
      });
  }

  // 4. Auth
  // в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  function setSessionUser(user) {
    sessionStorage.setItem("loggedIn", "true");
    sessionStorage.setItem("username", user.username);
    sessionStorage.setItem("fullName", user.fullName || user.username);
    sessionStorage.setItem("role", user.role || "operator");
    sessionStorage.setItem("userId", user.id || "");
  }
  function getSessionUser() {
    if (sessionStorage.getItem("loggedIn") !== "true") return null;
    return {
      username: sessionStorage.getItem("username") || "",
      fullName: sessionStorage.getItem("fullName") || "",
      role:     sessionStorage.getItem("role") || "operator",
      id:       sessionStorage.getItem("userId") || "",
    };
  }
  async function logout() {
    try {
      if (getToken()) {
        await apiFetch("/api/auth/logout", { method: "POST" });
      }
    } catch { /* ignore */ }
    setToken("");
    sessionStorage.removeItem(LOGIN_PASSWORD_KEY);
    sessionStorage.clear();
    window.location.href = "login.html";
  }

  const ROLE_ORDER = { viewer: 1, operator: 2, admin: 3 };
  function hasRole(userRole, req) { return (ROLE_ORDER[userRole]||0) >= (ROLE_ORDER[req]||0); }

  function checkAuth() {
    const user = getSessionUser();
    if (!user && !window.location.pathname.includes("login.html")) {
      window.location.href = "login.html";
      return null;
    }
    return user;
  }

  function requireRole(req) {
    const user = checkAuth();
    if (!user) return;
    if (!hasRole(user.role, req)) {
      showToast("Бұл бетке кіруге рұқсатыңыз жоқ", "error");
      setTimeout(() => { window.location.href = "dashboard.html"; }, 1500);
    }
  }

  // в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  // 5. UI role apply
  // в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  function applyRoleUI() {
    const user = getSessionUser();
    if (!user) return;
    const nameEl = document.querySelector("[data-user-name]");
    const roleEl = document.querySelector("[data-user-role]");
    if (nameEl) nameEl.textContent = user.fullName || user.username;
    if (roleEl) roleEl.textContent = user.role === "admin" ? "Administrator" : "Safety Operator";
    document.querySelectorAll("[data-role='admin']").forEach(el => {
      el.style.display = user.role === "admin" ? "" : "none";
    });
    document.querySelectorAll("[data-role-min]").forEach(el => {
      el.style.display = hasRole(user.role, el.getAttribute("data-role-min")) ? "" : "none";
    });
  }

  // в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

  // в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  // Activity log helpers
  // в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const ACTIVITY_KEY = "sv_activity_log";
  const SEEN_KEY     = "sv_activity_seen_at";

  function getActivities() {
    try {
      const arr = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]");
      if (!Array.isArray(arr)) return [];
      return arr.sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
    } catch { return []; }
  }
  function saveActivities(arr) {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(arr.slice(0, 120)));
  }
  function addActivity(title, desc, level = "info") {
    const item = {
      id: "act-" + Date.now() + "-" + Math.floor(Math.random() * 9999),
      title: title || "Әрекет",
      desc: desc || "",
      level,
      at: new Date().toISOString(),
    };
    // Real action happened — allow notifications to show again
    localStorage.removeItem("sv_activity_cleared");
    const arr = getActivities();
    arr.unshift(item);
    saveActivities(arr);
  }
  const ACTIVITY_CLEARED_KEY = "sv_activity_cleared";
  function clearActivities() {
    localStorage.setItem(ACTIVITY_KEY, "[]");
    localStorage.setItem(ACTIVITY_CLEARED_KEY, "1");
  }
  function initActivitiesIfEmpty() {
    // If user manually cleared notifications, do NOT re-seed
    if (localStorage.getItem(ACTIVITY_CLEARED_KEY) === "1") return;
    if (getActivities().length) return;
    const seed = getIncidents().slice(0, 8).map(x => ({
      id: "seed-" + x.id,
      title: "Оқиға тіркелді",
      desc: `${x.id} • ${x.type || "Оқиға"}`,
      level: x.severity === "high" ? "error" : "info",
      at: x.createdAt || new Date().toISOString(),
    }));
    if (seed.length) saveActivities(seed);
  }
  function relativeTime(ts) {
    const d = Math.max(0, Math.floor((Date.now() - new Date(ts || 0).getTime()) / 1000));
    if (d < 60)    return d + " сек бұрын";
    if (d < 3600)  return Math.floor(d / 60) + " мин бұрын";
    if (d < 86400) return Math.floor(d / 3600) + " сағ бұрын";
    return Math.floor(d / 86400) + " күн бұрын";
  }


  // 6. Login
  // в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  async function login(username, password) {
    initUsersIfEmpty();
    const users = getUsers();
    const u = users.find((x) => String(x.username || "").toLowerCase() === String(username || "").toLowerCase());
    if (!u) return { ok: false, message: "Қате логин немесе құпия сөз" };

    const expected = u.password || DEMO_PASSWORDS[u.username] || "";
    if (!expected || password !== expected) {
      return { ok: false, message: "Қате логин немесе құпия сөз" };
    }

    setToken(""); // backend token is not required for normal login flow
    sessionStorage.setItem(LOGIN_PASSWORD_KEY, password);
    setSessionUser(u);
    return { ok: true, user: u };
  }

  async function ensureBackendToken(force = false) {
    if (!force && getToken()) return { ok: true, token: getToken() };
    if (force) setToken("");
    const user = getSessionUser();
    if (!user) return { ok: false, message: "not authenticated" };

    const password =
      sessionStorage.getItem(LOGIN_PASSWORD_KEY) ||
      DEMO_PASSWORDS[user.username] ||
      "";
    if (!password) return { ok: false, message: "missing password for backend auth" };

    try {
      const r = await fetch(API_BASE + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, password }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d?.ok || !d.token) {
        return { ok: false, message: d?.message || "backend auth failed" };
      }
      setToken(d.token);
      if (d.user) setSessionUser(d.user);
      return { ok: true, token: d.token };
    } catch {
      return { ok: false, message: "backend unavailable" };
    }
  }

  async function register(fullName, email, username, password) {
    try {
      const r = await fetch(API_BASE + "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, username, password }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d?.ok) return { ok: false, message: d?.message || "Тіркелу мүмкін болмады" };
      setToken(d.token || "");
      setSessionUser(d.user || {});
      await hydrateFromBackend();
      return { ok: true, user: d.user };
    } catch {
      return { ok: false, message: "Серверге қосылу мүмкін болмады" };
    }
  }

  // 7. TOAST notification
  // в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  function showToast(message, type = "info", duration = 3500) {
    let container = document.getElementById("sv-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "sv-toast-container";
      container.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;";
      document.body.appendChild(container);
    }
    const colors = { success: "#16a34a", error: "#dc2626", warning: "#d97706", info: "#1a6fc4" };
    const icons  = { success: "check_circle", error: "error", warning: "warning", info: "info" };
    const toast  = document.createElement("div");
    toast.style.cssText = `background:white;border-left:4px solid ${colors[type]||colors.info};border-radius:10px;padding:12px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.12);display:flex;align-items:center;gap:10px;min-width:280px;max-width:360px;pointer-events:all;font-family:'Public Sans',sans-serif;font-size:14px;color:#374151;opacity:0;transform:translateX(20px);transition:all 0.3s ease;`;
    toast.innerHTML = `<span class="material-symbols-outlined" style="color:${colors[type]||colors.info};font-size:20px;flex-shrink:0;">${icons[type]||"info"}</span><span style="flex:1;">${message}</span><span class="material-symbols-outlined" style="color:#9ca3af;font-size:18px;cursor:pointer;flex-shrink:0;" onclick="this.parentElement.remove()">close</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = "1"; toast.style.transform = "translateX(0)"; });
    setTimeout(() => {
      toast.style.opacity = "0"; toast.style.transform = "translateX(20px)";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

  // в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  // Page meta
  // в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const PAGE_META = {
    "dashboard.html":       { crumbs: [{ label: "ҚауіпсіздікКөзі", href: "dashboard.html" }, { label: "Бақылау тақтасы" }] },
    "incidents.html":       { crumbs: [{ label: "ҚауіпсіздікКөзі", href: "dashboard.html" }, { label: "Оқиғалар тарихы" }] },
    "incident_detail.html": { crumbs: [{ label: "ҚауіпсіздікКөзі", href: "dashboard.html" }, { label: "Оқиғалар тарихы", href: "incidents.html" }, { label: "Мәлімет" }] },
    "cameras.html":         { crumbs: [{ label: "ҚауіпсіздікКөзі", href: "dashboard.html" }, { label: "Камералар" }] },
    "users.html":           { crumbs: [{ label: "ҚауіпсіздікКөзі", href: "dashboard.html" }, { label: "Пайдаланушылар" }] },
    "admin_dashboard.html": { crumbs: [{ label: "ҚауіпсіздікКөзі", href: "dashboard.html" }, { label: "Әкімші панелі" }] },
    "settings.html":        { crumbs: [{ label: "ҚауіпсіздікКөзі", href: "dashboard.html" }, { label: "Баптаулар" }] },
    "profile.html":         { crumbs: [{ label: "ҚауіпсіздікКөзі", href: "dashboard.html" }, { label: "Профиль" }] },
  };
  function getPageMeta() {
    const f = (window.location.pathname || "").split("/").pop() || "";
    return PAGE_META[f] || { crumbs: [{ label: "ҚауіпсіздікКөзі" }] };
  }

  // в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  // Global topbar (Student-PM style)
  // в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  function injectGlobalTopbar() {
    if (document.getElementById("sv-global-topbar")) return;
    const path = (window.location.pathname || "").toLowerCase();
    if (path.includes("login.html") || path.endsWith("/") || path.endsWith("/index.html")) return;

    if (!document.querySelector('link[href*="Material+Symbols+Outlined"]')) {
      const lnk = document.createElement("link");
      lnk.rel = "stylesheet";
      lnk.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined";
      document.head.appendChild(lnk);
    }

    if (!document.getElementById("sv-tb-style")) {
      const st = document.createElement("style");
      st.id = "sv-tb-style";
      st.textContent = `
        #sv-global-topbar {
          position: sticky; top: 0; z-index: 900;
          width: 100%; display: flex; align-items: center; gap: 12px;
          background: #ffffff;
          border-bottom: 1px solid #e8edf3;
          padding: 0 20px; height: 48px; flex-shrink: 0; box-sizing: border-box;
        }
        .sv-bc { display:flex; align-items:center; gap:5px; font-size:13px; font-weight:500; color:#7a8fa6; white-space:nowrap; flex-shrink:0; }
        .sv-bc a { color:#7a8fa6; text-decoration:none; transition:color .15s; }
        .sv-bc a:hover { color:#1a6fc4; text-decoration:underline; }
        .sv-bc-sep { color:#b8c8d8; font-size:13px; margin:0 1px; user-select:none; }
        .sv-bc-cur { color:#1a2433; font-weight:700; font-size:13px; }
        .sv-tb-flex { flex:1; min-width:8px; }
        .sv-sw { position:relative; flex-shrink:0; }
        .sv-si {
          height:32px; width:min(36vw,300px); min-width:140px;
          border:1px solid #cddaee; border-radius:8px;
          padding:0 58px 0 30px; font-size:13px; color:#334155;
          background:rgba(255,255,255,0.9); outline:none;
          transition:border-color .18s,background .18s,box-shadow .18s; box-sizing:border-box;
        }
        .sv-si:focus { border-color:#1a6fc4; background:#fff; box-shadow:0 0 0 3px rgba(26,111,196,.12); }
        .sv-si::placeholder { color:#9ab0c8; }
        .sv-sico { position:absolute; left:7px; top:50%; transform:translateY(-50%); color:#9ab0c8; font-size:18px; pointer-events:none; }
        .sv-sh {
          position:absolute; right:8px; top:50%; transform:translateY(-50%);
          font-size:10.5px; color:#9ab0c8; background:#eaf0f8;
          border:1px solid #cddaee; border-radius:4px; padding:1px 5px; pointer-events:none; white-space:nowrap;
        }
        .sv-ib {
          position:relative; width:32px; height:32px; border:none;
          background:rgba(255,255,255,0.5); border-radius:8px;
          display:flex; align-items:center; justify-content:center;
          color:#3a5a80; cursor:pointer; flex-shrink:0; transition:background .15s,color .15s;
        }
        .sv-ib:hover { background:rgba(255,255,255,0.9); color:#1a6fc4; }
        .sv-ib .material-symbols-outlined { font-size:20px; }
        .sv-bdg {
          position:absolute; top:2px; right:2px;
          min-width:16px; height:16px; border-radius:999px;
          background:#e03131; color:#fff; font-size:9.5px; font-weight:700;
          display:flex; align-items:center; justify-content:center;
          padding:0 3px; border:2px solid #f4f8ff; pointer-events:none;
        }
        .sv-av {
          width:28px; height:28px; border-radius:50%;
          background:linear-gradient(135deg,#1a6fc4,#42a5f5);
          border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          color:#fff; font-size:11px; font-weight:700;
          flex-shrink:0; transition:opacity .15s;
        }
        .sv-av:hover { opacity:.85; }
        #sv-np {
          position:fixed; top:48px; right:0;
          width:320px; height:calc(100vh - 48px);
          background:#fff; border-left:1px solid #e8edf3;
          box-shadow:-4px 0 20px rgba(15,23,42,.09);
          display:flex; flex-direction:column; z-index:890;
          transform:translateX(100%);
          transition:transform .22s cubic-bezier(.4,0,.2,1); overflow:hidden;
        }
        #sv-np.sv-open { transform:translateX(0); }
        .sv-nph {
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 16px 12px; border-bottom:1px solid #eef2f7; flex-shrink:0;
        }
        .sv-npt { font-size:14px; font-weight:700; color:#1a2433; }
        .sv-npa { display:flex; gap:6px; }
        .sv-npb {
          font-size:11px; font-weight:600; color:#6b7f96;
          background:#f4f7fb; border:1px solid #dce4ed;
          border-radius:6px; height:24px; padding:0 8px; cursor:pointer; transition:background .15s;
        }
        .sv-npb:hover { background:#e6eef8; color:#1a6fc4; }
        .sv-npl { flex:1; overflow-y:auto; display:flex; flex-direction:column; }
        .sv-npi {
          display:flex; gap:10px; padding:11px 16px;
          border-bottom:1px solid #f0f4f9; transition:background .12s; cursor:default;
        }
        .sv-npi:last-child { border-bottom:none; }
        .sv-npi:hover { background:#f7faff; }
        .sv-npic { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
        .sv-npic.info    { background:#eff6ff; color:#2563eb; }
        .sv-npic.success { background:#ecfdf5; color:#16a34a; }
        .sv-npic.warning { background:#fff7ed; color:#ea580c; }
        .sv-npic.error   { background:#fef2f2; color:#dc2626; }
        .sv-npib { min-width:0; flex:1; }
        .sv-npit { font-size:12.5px; font-weight:700; color:#111827; line-height:1.3; }
        .sv-npid { font-size:11.5px; color:#64748b; margin-top:2px; line-height:1.35; }
        .sv-npim { font-size:10.5px; color:#94a3b8; margin-top:3px; }
        .sv-npe  { padding:32px 16px; text-align:center; font-size:13px; color:#94a3b8; }
        #sv-npo { display:none; position:fixed; inset:0; z-index:889; }
        #sv-npo.sv-open { display:block; }
        @media(max-width:640px){ .sv-si{width:100px;min-width:70px;} #sv-np{width:100vw;} }
        @media print{ #sv-global-topbar,#sv-np{display:none!important;} }
      `;
      document.head.appendChild(st);
    }

    const meta = getPageMeta();
    const bcHtml = meta.crumbs.map((c, i) => {
      const last = i === meta.crumbs.length - 1;
      const sep = i > 0 ? `<span class="sv-bc-sep">/</span>` : "";
      return last
        ? `${sep}<span class="sv-bc-cur">${c.label}</span>`
        : `${sep}<a href="${c.href || "#"}">${c.label}</a>`;
    }).join("");

    const u = getSessionUser();
    const ini = u ? (u.fullName || u.username || "?").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "?";

    const bar = document.createElement("div");
    bar.id = "sv-global-topbar";
    bar.innerHTML = `
      <div class="sv-bc">${bcHtml}</div>
      <div class="sv-tb-flex"></div>
      <div class="sv-sw">
        <span class="material-symbols-outlined sv-sico">search</span>
        <input id="svGSInput" class="sv-si" placeholder="Жылдам іздеу..." autocomplete="off" spellcheck="false"/>
        <span class="sv-sh">Ctrl+K</span>
      </div>
      <button id="svBellBtn" class="sv-ib" title="Хабарламалар">
        <span class="material-symbols-outlined">notifications</span>
        <span id="svBellBadge" class="sv-bdg" style="display:none">0</span>
      </button>
      <button class="sv-av" title="${u ? (u.fullName || u.username) : ""}" onclick="window.location.href='profile.html'">${ini}</button>
    `;

    const overlay = document.createElement("div");
    overlay.id = "sv-npo";
    document.body.appendChild(overlay);

    const panel = document.createElement("div");
    panel.id = "sv-np";
    panel.innerHTML = `
      <div class="sv-nph">
        <span class="sv-npt">Хабарламалар</span>
        <div class="sv-npa">
          <button id="svNpRead"  class="sv-npb">Барлығын оқу</button>
          <button id="svNpClear" class="sv-npb">Тазалау</button>
        </div>
      </div>
      <div id="svNpList" class="sv-npl"></div>
    `;
    document.body.appendChild(panel);

    const mainEl = document.querySelector("main");
    if (mainEl && mainEl.parentElement) {
      const col = document.createElement("div");
      col.style.cssText = "display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden;";
      mainEl.parentElement.insertBefore(col, mainEl);
      col.appendChild(bar);
      col.appendChild(mainEl);
    } else {
      bar.style.cssText = "position:fixed;top:0;left:0;right:0;";
      document.body.prepend(bar);
    }

    // Search
    const input = bar.querySelector("#svGSInput");
    const PAGES = [
      { kw: ["бақылау","тақта","dashboard"], href: "dashboard.html" },
      { kw: ["оқиға","инцидент","тарих"],    href: "incidents.html" },
      { kw: ["камера","video"],              href: "cameras.html" },
      { kw: ["баптау","setting"],            href: "settings.html" },
      { kw: ["профиль","profile"],           href: "profile.html" },
      { kw: ["пайдаланушы","users"],         href: "users.html" },
      { kw: ["әкімші","admin"],              href: "admin_dashboard.html" },
    ];
    input.addEventListener("keydown", e => {
      if (e.key !== "Enter") return;
      const q = input.value.trim().toLowerCase();
      const hit = PAGES.find(p => p.kw.some(k => k.includes(q) || q.includes(k)));
      if (hit) window.location.href = hit.href;
      else showToast("Бет табылмады", "warning");
    });

    // Notifications
    const bellBtn  = bar.querySelector("#svBellBtn");
    const badge    = bar.querySelector("#svBellBadge");
    const list     = panel.querySelector("#svNpList");
    const readBtn  = panel.querySelector("#svNpRead");
    const clearBtn = panel.querySelector("#svNpClear");

    const safe = s => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const ICON = { success:"check_circle", warning:"warning", error:"error", info:"notifications" };

    const render = () => {
      const items = getActivities().slice(0, 20);
      if (!items.length) {
        list.innerHTML = `<div class="sv-npe">Хабарламалар жоқ</div>`;
        return;
      }
      list.innerHTML = items.map(x => `
        <div class="sv-npi">
          <div class="sv-npic ${x.level||"info"}">
            <span class="material-symbols-outlined" style="font-size:15px">${ICON[x.level]||ICON.info}</span>
          </div>
          <div class="sv-npib">
            <div class="sv-npit">${safe(x.title)}</div>
            <div class="sv-npid">${safe(x.desc)}</div>
            <div class="sv-npim">${relativeTime(x.at)}</div>
          </div>
        </div>`).join("");
    };

    const updateBadge = () => {
      const seen = Number(sessionStorage.getItem(SEEN_KEY)||0);
      const n = getActivities().filter(x => new Date(x.at||0).getTime() > seen).length;
      badge.textContent = n > 99 ? "99+" : String(n);
      badge.style.display = n > 0 ? "flex" : "none";
    };
    const markRead  = () => { sessionStorage.setItem(SEEN_KEY, String(Date.now())); updateBadge(); };
    const openPanel = () => { panel.classList.add("sv-open"); overlay.classList.add("sv-open"); render(); markRead(); };
    const closePanel= () => { panel.classList.remove("sv-open"); overlay.classList.remove("sv-open"); };

    bellBtn.addEventListener("click", e => { e.stopPropagation(); panel.classList.contains("sv-open") ? closePanel() : openPanel(); });
    overlay.addEventListener("click", closePanel);
    readBtn.addEventListener("click",  () => { markRead(); showToast("Барлық хабарлама оқылды", "success", 1800); });
    clearBtn.addEventListener("click", () => { clearActivities(); render(); markRead(); showToast("Хабарламалар тазаланды", "info", 1800); });
    document.addEventListener("click",   e => { if (!panel.contains(e.target) && !bellBtn.contains(e.target)) closePanel(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closePanel();
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); input.focus(); input.select(); }
    });

    updateBadge();
    render();
    setInterval(() => { updateBadge(); if (panel.classList.contains("sv-open")) render(); }, 5000);
    window.addEventListener("storage", e => {
      if (e.key === ACTIVITY_KEY || e.key === "sv_incidents") { updateBadge(); if (panel.classList.contains("sv-open")) render(); }
    });
  }

  // 8. DOMContentLoaded
  // в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  document.addEventListener("DOMContentLoaded", async function () {
    initUsersIfEmpty();
    initIncidentsIfEmpty();
    initCamerasIfEmpty();
    repairMojibakeData();
    if ((window.location.pathname || "").toLowerCase().includes("cameras.html")) {
      await hydrateFromBackend();
    }
    checkAuth();
    applyRoleUI();
    initActivitiesIfEmpty();
    injectGlobalTopbar();
    document.querySelectorAll('[href="#logout"], .logout-btn').forEach(el => {
      el.addEventListener("click", e => { e.preventDefault(); logout(); });
    });
  });

  // в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  // 9. Public API
  // в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  window.SafetyVision = window.SafetyVision || {};
  window.SafetyVision.auth = { login, logout, checkAuth, requireRole, getSessionUser, applyRoleUI, getUsers, authHeader, getToken, ensureBackendToken };
  window.SafetyVision.incidents = { getAll: getIncidents, add: addIncident, update: updateIncident, remove: deleteIncident };
  window.SafetyVision.users = { getAll: getUsers, add: addUser, update: updateUser, remove: deleteUser, changePassword };
  window.SafetyVision.toast = showToast;
  window.SafetyVision.fmt = fmt;
  window.SafetyVision.activities = { getAll: getActivities, add: addActivity, clear: clearActivities, resetCleared: () => localStorage.removeItem("sv_activity_cleared") };
  window.SafetyVision.notify = showToast;

})();
