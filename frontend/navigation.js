// navigation.js — ҚауіпсіздікКөзі RBAC + Auth + Demo Seed + Toast
// v2.0 — 1-Кезең

(function () {
  "use strict";

  const USERS_KEY     = "sv_users";
  const INCIDENTS_KEY = "sv_incidents";
  const CAMERAS_KEY   = "sv_cameras";

  // ─────────────────────────────────────────────
  // 1. DEMO SEED — бір рет инициализация
  // ─────────────────────────────────────────────
  function initUsersIfEmpty() {
    if (localStorage.getItem(USERS_KEY)) return;
    const demoUsers = [
      { id: "u1", username: "admin",    password: "admin123", fullName: "Алмас Беков",    role: "admin",    email: "admin@safety.kz",    createdAt: "2024-01-10" },
      { id: "u2", username: "operator", password: "op123",    fullName: "Дина Сейткали",  role: "operator", email: "dina@safety.kz",      createdAt: "2024-02-15" },
      { id: "u3", username: "operator2",password: "op456",    fullName: "Серік Жаксыбек", role: "operator", email: "serik@safety.kz",     createdAt: "2024-03-20" },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers));
  }

  function initIncidentsIfEmpty() {
    if (localStorage.getItem(INCIDENTS_KEY)) return;
    const now = Date.now();
    const day = 86400000;
    const demoIncidents = [
      { id: "INC-0012", type: "Каска жоқ",              location: "Қойма B секциясы / Кам-03", severity: "high",   status: "Open",        camera: "CAM-03", createdAt: new Date(now - 2*60000).toISOString(),    date: fmt(now - 2*60000),    note: "" },
      { id: "INC-0011", type: "Жақындық ескертуі",      location: "Жүктеу аймағы 1 / Кам-07",  severity: "medium", status: "Investigating",camera: "CAM-07", createdAt: new Date(now - 5*60000).toISOString(),    date: fmt(now - 5*60000),    note: "" },
      { id: "INC-0010", type: "Қауіпсіздік жилеті жоқ", location: "Жинау желісі 2 / Кам-08",  severity: "high",   status: "Open",        camera: "CAM-08", createdAt: new Date(now - 1*3600000).toISOString(),  date: fmt(now - 1*3600000),  note: "" },
      { id: "INC-0009", type: "Аймаққа рұқсатсыз кіру", location: "Шеткі қоршау / Кам-21",    severity: "medium", status: "Resolved",    camera: "CAM-21", createdAt: new Date(now - 3*3600000).toISOString(),  date: fmt(now - 3*3600000),  note: "Оператор тексерді" },
      { id: "INC-0008", type: "Каска жоқ",              location: "4-сектор / Кам-12",          severity: "high",   status: "Resolved",    camera: "CAM-12", createdAt: new Date(now - 1*day).toISOString(),      date: fmt(now - 1*day),      note: "Жұмысшыға ескерту берілді" },
      { id: "INC-0007", type: "Адам анықталды",         location: "Кіреберіс / Кам-01",         severity: "low",    status: "Resolved",    camera: "CAM-01", createdAt: new Date(now - 1*day - 2*3600000).toISOString(), date: fmt(now - 1*day - 2*3600000), note: "" },
      { id: "INC-0006", type: "Жақындық ескертуі",      location: "Қойма A / Кам-03",           severity: "medium", status: "Resolved",    camera: "CAM-03", createdAt: new Date(now - 2*day).toISOString(),      date: fmt(now - 2*day),      note: "" },
      { id: "INC-0005", type: "Қауіпсіздік жилеті жоқ", location: "Жинау желісі 3 / Кам-09",  severity: "high",   status: "Resolved",    camera: "CAM-09", createdAt: new Date(now - 3*day).toISOString(),      date: fmt(now - 3*day),      note: "" },
      { id: "INC-0004", type: "Каска жоқ",              location: "Жүктеу аймағы 2 / Кам-11",  severity: "high",   status: "Resolved",    camera: "CAM-11", createdAt: new Date(now - 4*day).toISOString(),      date: fmt(now - 4*day),      note: "" },
      { id: "INC-0003", type: "Аймаққа рұқсатсыз кіру", location: "Шеткі қоршау / Кам-21",    severity: "low",    status: "Resolved",    camera: "CAM-21", createdAt: new Date(now - 5*day).toISOString(),      date: fmt(now - 5*day),      note: "" },
      { id: "INC-0002", type: "Жақындық ескертуі",      location: "4-сектор / Кам-12",          severity: "medium", status: "Resolved",    camera: "CAM-12", createdAt: new Date(now - 6*day).toISOString(),      date: fmt(now - 6*day),      note: "" },
      { id: "INC-0001", type: "Каска жоқ",              location: "Қойма B секциясы / Кам-03", severity: "high",   status: "Resolved",    camera: "CAM-03", createdAt: new Date(now - 7*day).toISOString(),      date: fmt(now - 7*day),      note: "" },
    ];
    localStorage.setItem(INCIDENTS_KEY, JSON.stringify(demoIncidents));
  }

  function initCamerasIfEmpty() {
    if (localStorage.getItem(CAMERAS_KEY)) return;
    const demoCameras = [
      { id: "CAM-01", name: "Кіреберіс",           location: "Негізгі кіреберіс",      status: "online",  lastIncident: "2 күн бұрын" },
      { id: "CAM-03", name: "Қойма B / Кам-03",    location: "Қойма B секциясы",        status: "alert",   lastIncident: "2 мин бұрын" },
      { id: "CAM-07", name: "Жүктеу аймағы 1",     location: "Жүктеу аймағы 1",         status: "warning", lastIncident: "5 мин бұрын" },
      { id: "CAM-08", name: "Жинау желісі 2",      location: "Жинау желісі 2",          status: "online",  lastIncident: "1 сағат бұрын" },
      { id: "CAM-09", name: "Жинау желісі 3",      location: "Жинау желісі 3",          status: "online",  lastIncident: "3 күн бұрын" },
      { id: "CAM-11", name: "Жүктеу аймағы 2",     location: "Жүктеу аймағы 2",         status: "online",  lastIncident: "4 күн бұрын" },
      { id: "CAM-12", name: "4-сектор / Кам-12",   location: "4-сектор",                status: "online",  lastIncident: "1 күн бұрын" },
      { id: "CAM-21", name: "Шеткі қоршау — шығыс",location: "Шеткі қоршау",            status: "offline", lastIncident: "5 күн бұрын" },
    ];
    localStorage.setItem(CAMERAS_KEY, JSON.stringify(demoCameras));
  }

  function fmt(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString("kk-KZ") + " " + d.toLocaleTimeString("kk-KZ", { hour: "2-digit", minute: "2-digit" });
  }

  // ─────────────────────────────────────────────
  // 2. CRUD helpers — incidents
  // ─────────────────────────────────────────────
  function getIncidents() {
    try { return JSON.parse(localStorage.getItem(INCIDENTS_KEY) || "[]"); } catch { return []; }
  }
  function saveIncidents(arr) {
    localStorage.setItem(INCIDENTS_KEY, JSON.stringify(arr));
  }
  function addIncident(data) {
    const arr = getIncidents();
    const id = "INC-" + String(arr.length + 1).padStart(4, "0");
    const now = new Date();
    const item = { id, ...data, createdAt: now.toISOString(), date: fmt(now.getTime()), status: data.status || "Open", note: data.note || "" };
    arr.unshift(item);
    saveIncidents(arr);
    return item;
  }
  function updateIncident(id, patch) {
    const arr = getIncidents().map(x => x.id === id ? { ...x, ...patch } : x);
    saveIncidents(arr);
  }
  function deleteIncident(id) {
    saveIncidents(getIncidents().filter(x => x.id !== id));
  }

  // ─────────────────────────────────────────────
  // 3. CRUD helpers — users
  // ─────────────────────────────────────────────
  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
  }
  function saveUsers(arr) { localStorage.setItem(USERS_KEY, JSON.stringify(arr)); }
  function addUser(data) {
    const arr = getUsers();
    if (arr.find(u => u.username === data.username)) return { ok: false, message: "Бұл логин бос емес" };
    const id = "u" + (arr.length + 1);
    arr.push({ id, ...data, createdAt: new Date().toLocaleDateString("kk-KZ") });
    saveUsers(arr);
    return { ok: true };
  }
  function updateUser(id, patch) {
    const arr = getUsers().map(u => u.id === id ? { ...u, ...patch } : u);
    saveUsers(arr);
  }
  function deleteUser(id) {
    saveUsers(getUsers().filter(u => u.id !== id));
  }

  // ─────────────────────────────────────────────
  // 4. Auth
  // ─────────────────────────────────────────────
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
  function logout() { sessionStorage.clear(); window.location.href = "login.html"; }

  const ROLE_ORDER = { viewer: 1, operator: 2, admin: 3 };
  function hasRole(userRole, req) { return (ROLE_ORDER[userRole]||0) >= (ROLE_ORDER[req]||0); }

  function checkAuth() {
    const user = getSessionUser();
    if (!user && !window.location.pathname.includes("login.html")) {
      window.location.href = "login.html";
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

  // ─────────────────────────────────────────────
  // 5. UI role apply
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // 6. Login
  // ─────────────────────────────────────────────
  function login(username, password) {
    initUsersIfEmpty();
    const u = getUsers().find(x => x.username === username && x.password === password);
    if (!u) return { ok: false, message: "Логин немесе құпия сөз қате" };
    setSessionUser(u);
    return { ok: true, user: u };
  }

  // ─────────────────────────────────────────────
  // 7. TOAST notification
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // 8. DOMContentLoaded
  // ─────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function () {
    initUsersIfEmpty();
    initIncidentsIfEmpty();
    initCamerasIfEmpty();
    checkAuth();
    applyRoleUI();
    document.querySelectorAll('[href="#logout"], .logout-btn').forEach(el => {
      el.addEventListener("click", e => { e.preventDefault(); logout(); });
    });
  });

  // ─────────────────────────────────────────────
  // 9. Public API
  // ─────────────────────────────────────────────
  window.SafetyVision = window.SafetyVision || {};
  window.SafetyVision.auth = { login, logout, checkAuth, requireRole, getSessionUser, applyRoleUI, getUsers };
  window.SafetyVision.incidents = { getAll: getIncidents, add: addIncident, update: updateIncident, remove: deleteIncident };
  window.SafetyVision.users = { getAll: getUsers, add: addUser, update: updateUser, remove: deleteUser };
  window.SafetyVision.toast = showToast;
  window.SafetyVision.fmt = fmt;

})();
