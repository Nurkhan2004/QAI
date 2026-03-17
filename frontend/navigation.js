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
    addActivity("Оқиға қосылды", `${id} • ${item.type||"Оқиға"} — ${item.location||""}`, item.severity === "high" ? "error" : "info");
    return item;
  }
  function updateIncident(id, patch) {
    const before = getIncidents().find(x => x.id === id);
    const arr = getIncidents().map(x => x.id === id ? { ...x, ...patch } : x);
    saveIncidents(arr);
    const st = patch.status || before?.status || "";
    const title = st === "Resolved" ? "Оқиға шешілді" : st === "Investigating" ? "Тексерілуде" : "Оқиға жаңартылды";
    addActivity(title, `${id} • ${patch.note || st || "Жаңарту"}`, st === "Resolved" ? "success" : "info");
  }
  function deleteIncident(id) {
    const before = getIncidents().find(x => x.id === id);
    saveIncidents(getIncidents().filter(x => x.id !== id));
    addActivity("Оқиға жойылды", `${id} • ${before?.type||"Оқиға"}`, "warning");
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
  // 7. Activity log + Notifications
  // ─────────────────────────────────────────────
  const ACTIVITY_KEY         = "sv_activity_log";
  const ACTIVITY_SEEN_KEY    = "sv_activity_seen_at";
  const ACTIVITY_CLEARED_KEY = "sv_activity_cleared";

  function getActivities() {
    try {
      const arr = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]");
      return Array.isArray(arr) ? arr.sort((a, b) => new Date(b.at||0) - new Date(a.at||0)) : [];
    } catch { return []; }
  }
  function saveActivities(arr) {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(arr.slice(0, 120)));
  }
  function addActivity(title, desc, level = "info") {
    const item = { id: "act-" + Date.now() + "-" + Math.floor(Math.random()*9999), title: title || "Әрекет", desc: desc || "", level, at: new Date().toISOString() };
    localStorage.removeItem(ACTIVITY_CLEARED_KEY);
    const arr = getActivities();
    arr.unshift(item);
    saveActivities(arr);
  }
  function clearActivities() {
    localStorage.setItem(ACTIVITY_KEY, "[]");
    localStorage.setItem(ACTIVITY_CLEARED_KEY, "1");
  }
  function initActivitiesIfEmpty() {
    if (localStorage.getItem(ACTIVITY_CLEARED_KEY) === "1") return;
    if (getActivities().length) return;
    const seed = getIncidents().slice(0, 6).map(x => ({
      id: "seed-" + x.id,
      title: "Оқиға тіркелді",
      desc: `${x.id} • ${x.type || "Оқиға"}`,
      level: x.severity === "high" ? "error" : "info",
      at: x.createdAt || new Date().toISOString(),
    }));
    if (seed.length) saveActivities(seed);
  }
  function relTime(ts) {
    const d = Math.max(0, Math.floor((Date.now() - new Date(ts||0).getTime()) / 1000));
    if (d < 60)    return d + " сек бұрын";
    if (d < 3600)  return Math.floor(d/60) + " мин бұрын";
    if (d < 86400) return Math.floor(d/3600) + " сағ бұрын";
    return Math.floor(d/86400) + " күн бұрын";
  }

  // ─────────────────────────────────────────────
  // 8. Global Topbar Injection
  // ─────────────────────────────────────────────
  function injectGlobalTopbar() {
    if (document.getElementById("sv-topbar")) return;
    if ((window.location.pathname||"").toLowerCase().includes("login.html")) return;

    const u = getSessionUser();
    const ini = u ? (u.fullName||u.username||"U").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) : "?";

    const pages = { "dashboard.html":"Бақылау тақтасы","cameras.html":"Камералар","incidents.html":"Оқиғалар тарихы","incident_detail.html":"Оқиға мәліметі","users.html":"Пайдаланушылар","admin_dashboard.html":"Әкімші панелі","settings.html":"Баптаулар","profile.html":"Профиль" };
    const path  = (window.location.pathname||"").split("/").pop();
    const pageTitle = pages[path] || "";

    // Styles
    const style = document.createElement("style");
    style.textContent = `
      #sv-topbar{background:#14181f;height:56px;display:flex;align-items:center;padding:0 20px;gap:16px;border-bottom:1px solid rgba(255,255,255,0.06);position:sticky;top:0;z-index:200;flex-shrink:0;font-family:'Public Sans',sans-serif;}
      #sv-tb-search-wrap{flex:1;max-width:340px;position:relative;margin-left:auto;}
      #sv-tb-search{width:100%;background:#f0f6ff;border:1px solid #c8ddf5;border-radius:10px;height:34px;padding:0 52px 0 34px;font-size:13px;color:#334155;outline:none;box-sizing:border-box;font-family:'Public Sans',sans-serif;}
      #sv-tb-search:focus{border-color:#1a6fc4;box-shadow:0 0 0 3px rgba(26,111,196,0.15);}
      #sv-tb-search-ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none;}
      #sv-tb-ctrlk{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:#e8f0fb;border:1px solid #c8ddf5;border-radius:5px;padding:1px 6px;font-size:11px;color:#1a6fc4;font-family:monospace;line-height:18px;font-weight:500;pointer-events:none;}
      #sv-bell-wrap{position:relative;}
      #sv-bell-btn{width:36px;height:36px;border-radius:10px;background:#f0f6ff;border:1px solid #c8ddf5;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
      #sv-bell-btn:hover{background:#ddeeff;border-color:#1a6fc4;}
      #sv-bell-badge{position:absolute;top:3px;right:3px;min-width:17px;height:17px;background:#e24b4a;border-radius:50%;font-size:10px;color:#fff;font-weight:700;display:none;align-items:center;justify-content:center;border:2px solid #14181f;padding:0 3px;}
      #sv-tb-divider{width:1px;height:22px;background:rgba(255,255,255,0.07);margin:0 6px;flex-shrink:0;}
      #sv-tb-avatar-btn{display:flex;align-items:center;gap:9px;background:transparent;border:none;cursor:pointer;padding:4px 8px;border-radius:10px;transition:background 0.15s;}
      #sv-tb-avatar-btn:hover{background:rgba(255,255,255,0.06);}
      .sv-tb-avi{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#1a6fc4,#42a5f5);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:11px;font-weight:700;}
      /* Notification panel */
      #sv-np-overlay{display:none;position:fixed;inset:0;z-index:198;}
      #sv-np-overlay.open{display:block;}
      #sv-np{position:fixed;top:62px;right:16px;width:340px;background:#fff;border:1px solid #e2e8f0;border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,0.12);z-index:199;display:none;flex-direction:column;overflow:hidden;max-height:480px;}
      #sv-np.open{display:flex;}
      .sv-np-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 12px;border-bottom:1px solid #f1f5f9;flex-shrink:0;}
      .sv-np-title{font-size:14px;font-weight:600;color:#1e293b;}
      .sv-np-actions{display:flex;gap:6px;}
      .sv-np-btn{background:transparent;border:1px solid #e2e8f0;border-radius:7px;padding:3px 10px;font-size:12px;color:#64748b;cursor:pointer;transition:all 0.15s;font-family:'Public Sans',sans-serif;}
      .sv-np-btn:hover{background:#f8fafc;color:#1e293b;}
      #sv-np-list{overflow-y:auto;flex:1;}
      .sv-np-item{display:flex;gap:10px;padding:12px 16px;border-bottom:1px solid #f8fafc;transition:background 0.12s;}
      .sv-np-item:hover{background:#f8fafc;}
      .sv-np-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:15px;}
      .sv-np-icon.error{background:#fef2f2;color:#dc2626;}
      .sv-np-icon.warning{background:#fffbeb;color:#d97706;}
      .sv-np-icon.success{background:#f0fdf4;color:#16a34a;}
      .sv-np-icon.info{background:#eff6ff;color:#1a6fc4;}
      .sv-np-body{flex:1;min-width:0;}
      .sv-np-t{font-size:13px;font-weight:500;color:#1e293b;margin:0 0 2px;}
      .sv-np-d{font-size:12px;color:#64748b;margin:0 0 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .sv-np-m{font-size:11px;color:#94a3b8;margin:0;}
      .sv-np-empty{padding:32px 16px;text-align:center;color:#94a3b8;font-size:13px;}
    `;
    document.head.appendChild(style);

    // Topbar element
    const bar = document.createElement("div");
    bar.id = "sv-topbar";
    bar.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
        <span style="color:#4fa3e8;font-size:13px;font-weight:600;">ҚауіпсіздікКөзі</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 3L7.5 6L4.5 9" stroke="#2e3a50" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span style="color:#8a9bb0;font-size:13px;">${pageTitle}</span>
      </div>
      <div id="sv-tb-search-wrap">
        <svg id="sv-tb-search-ico" width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="#93b8df" stroke-width="1.4"/><path d="M10.5 10.5L13 13" stroke="#93b8df" stroke-width="1.4" stroke-linecap="round"/></svg>
        <input id="sv-tb-search" type="text" placeholder="Жылдам іздеу..." autocomplete="off"/>
        <div id="sv-tb-ctrlk">Ctrl+K</div>
      </div>
      <div style="display:flex;align-items:center;gap:4px;margin-left:4px;">
        <div id="sv-bell-wrap">
          <button id="sv-bell-btn" title="Хабарламалар">
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><path d="M9 2a5.5 5.5 0 0 1 5.5 5.5v2.3l1.2 2.2H2.3L3.5 9.8V7.5A5.5 5.5 0 0 1 9 2Z" stroke="#1a6fc4" stroke-width="1.5"/><path d="M7.5 14.5a1.5 1.5 0 0 0 3 0" stroke="#1a6fc4" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <span id="sv-bell-badge">0</span>
        </div>
        <div id="sv-tb-divider"></div>
        <button id="sv-tb-avatar-btn" title="${u ? (u.fullName||u.username) : ""}" onclick="window.location.href='profile.html'">
          <div class="sv-tb-avi">${ini}</div>
          <div style="text-align:left;line-height:1.3;">
            <p data-user-name style="color:#e2e2f0;font-size:12px;font-weight:600;margin:0;">${u ? (u.fullName||u.username) : "—"}</p>
            <p data-user-role style="color:#4a5a70;font-size:11px;margin:0;">${u?.role === "admin" ? "Administrator" : "Safety Operator"}</p>
          </div>
        </button>
      </div>
    `;

    // Notification panel
    const overlay = document.createElement("div"); overlay.id = "sv-np-overlay"; document.body.appendChild(overlay);
    const panel = document.createElement("div"); panel.id = "sv-np";
    panel.innerHTML = `
      <div class="sv-np-head">
        <span class="sv-np-title">Хабарламалар</span>
        <div class="sv-np-actions">
          <button class="sv-np-btn" id="sv-np-read">Барлығын оқу</button>
          <button class="sv-np-btn" id="sv-np-clear">Тазалау</button>
        </div>
      </div>
      <div id="sv-np-list"></div>
    `;
    document.body.appendChild(panel);

    // Insert bar into layout
    const mainEl = document.querySelector("main");
    if (mainEl && mainEl.parentElement) {
      const col = document.createElement("div");
      col.style.cssText = "display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden;";
      mainEl.parentElement.insertBefore(col, mainEl);
      col.appendChild(bar);
      col.appendChild(mainEl);
    } else {
      bar.style.cssText += ";position:fixed;top:0;left:0;right:0;";
      document.body.prepend(bar);
    }

    const ICONS = { error:"error", warning:"warning", success:"check_circle", info:"notifications" };
    const safe  = s => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const list  = panel.querySelector("#sv-np-list");
    const badge = bar.querySelector("#sv-bell-badge");

    function renderPanel() {
      const items = getActivities().slice(0, 20);
      if (!items.length) {
        list.innerHTML = `<div class="sv-np-empty">Хабарламалар жоқ</div>`;
        return;
      }
      list.innerHTML = items.map(x => `
        <div class="sv-np-item">
          <div class="sv-np-icon ${x.level||'info'}"><span class="material-symbols-outlined" style="font-size:15px;">${ICONS[x.level]||"notifications"}</span></div>
          <div class="sv-np-body">
            <p class="sv-np-t">${safe(x.title)}</p>
            <p class="sv-np-d">${safe(x.desc)}</p>
            <p class="sv-np-m">${relTime(x.at)}</p>
          </div>
        </div>`).join("");
    }

    function updateBadge() {
      const seen = Number(sessionStorage.getItem(ACTIVITY_SEEN_KEY)||0);
      const n = getActivities().filter(x => new Date(x.at||0).getTime() > seen).length;
      badge.textContent = n > 99 ? "99+" : String(n);
      badge.style.display = n > 0 ? "flex" : "none";
    }
    const markRead   = () => { sessionStorage.setItem(ACTIVITY_SEEN_KEY, String(Date.now())); updateBadge(); };
    const openPanel  = () => { panel.classList.add("open"); overlay.classList.add("open"); renderPanel(); markRead(); };
    const closePanel = () => { panel.classList.remove("open"); overlay.classList.remove("open"); };

    bar.querySelector("#sv-bell-btn").addEventListener("click", e => { e.stopPropagation(); panel.classList.contains("open") ? closePanel() : openPanel(); });
    overlay.addEventListener("click", closePanel);
    panel.querySelector("#sv-np-read").addEventListener("click",  () => { markRead(); showToast("Барлық хабарлама оқылды", "success", 1800); });
    panel.querySelector("#sv-np-clear").addEventListener("click", () => { clearActivities(); renderPanel(); markRead(); showToast("Хабарламалар тазаланды", "info", 1800); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closePanel();
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); bar.querySelector("#sv-tb-search").focus(); }
    });

    // Search
    const PAGES = [
      { kw:["бақылау","тақта","dashboard"],   href:"dashboard.html" },
      { kw:["оқиға","инцидент","тарих"],      href:"incidents.html" },
      { kw:["камера","video","бейне"],         href:"cameras.html" },
      { kw:["баптау","setting"],              href:"settings.html" },
      { kw:["профиль","profile"],             href:"profile.html" },
      { kw:["пайдаланушы","users"],           href:"users.html" },
      { kw:["әкімші","admin"],               href:"admin_dashboard.html" },
    ];
    bar.querySelector("#sv-tb-search").addEventListener("keydown", e => {
      if (e.key !== "Enter") return;
      const q = e.target.value.trim().toLowerCase();
      const hit = PAGES.find(p => p.kw.some(k => k.includes(q) || q.includes(k)));
      if (hit) window.location.href = hit.href;
      else showToast("Бет табылмады", "warning");
    });

    updateBadge();
    setInterval(() => { updateBadge(); if (panel.classList.contains("open")) renderPanel(); }, 5000);
    window.addEventListener("storage", e => { if (e.key === ACTIVITY_KEY) { updateBadge(); if (panel.classList.contains("open")) renderPanel(); } });
  }

  // ─────────────────────────────────────────────
  // TOAST notification
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
    initActivitiesIfEmpty();
    injectGlobalTopbar();
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
  window.SafetyVision.activities = { getAll: getActivities, add: addActivity, clear: clearActivities };
  window.SafetyVision.toast = showToast;
  window.SafetyVision.fmt = fmt;

})();
