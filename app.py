"""
app.py — ҚауіпсіздікКөзі | Flask + YOLOv8  v5.0
══════════════════════════════════════════════════
Іске қосу:
    pip install flask flask-cors opencv-python ultralytics numpy

Модель:
    models/helmet_model.pt  ← автоматты жүктеледі (бір рет), сонда сақталады
    models/best.pt          ← өзіңіздің custom моделіңіз (қойсаңыз осы жұмыс жасайды)

Нәтиже:
    Каска БАР  → жасыл box  + "Helmet"
    Каска ЖОҚ  → қызыл box  + "No Helmet"
"""

import cv2
import numpy as np
import threading
import time
import os
import sys
import shutil
from datetime import datetime
from collections import deque
from flask import Flask, Response, jsonify, request
from flask_cors import CORS

try:
    from ultralytics import YOLO
    import torch
    YOLO_AVAILABLE = True
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
except ImportError:
    YOLO_AVAILABLE = False
    DEVICE = "cpu"

# ═══════════════════════════════════════════════════════════════
#  CONFIG
# ═══════════════════════════════════════════════════════════════
HOST  = "0.0.0.0"
PORT  = 8000

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

CUSTOM_MODEL  = os.path.join(MODELS_DIR, "best.pt")         # өзіңіздің моделіңіз
HELMET_MODEL  = os.path.join(MODELS_DIR, "helmet_model.pt") # автожүктелетін каска моделі

# ── Confidence шектері ────────────────────────────────────────
HELMET_CONF    = 0.60   # 60%+ → Helmet деп санаймыз
NO_HELMET_CONF = 0.50   # 50%+ → No Helmet деп санаймыз
DETECT_CONF    = 0.40   # модельге берілетін жалпы шек

MAX_FPS       = 25
COOLDOWN_SEC  = 5
MAX_INCIDENTS = 500

DEFAULT_CAMERAS = [
    {"id": "CAM-01", "source": 0, "name": "Webcam"},
]

# ── Түстер (BGR формат) ───────────────────────────────────────
GREEN = (34, 197, 94)    # жасыл  — Helmet
RED   = (30,  30, 220)   # қызыл  — No Helmet
GRAY  = (150, 150, 150)  # сұр    — белгісіз


# ═══════════════════════════════════════════════════════════════
#  МОДЕЛЬ ЖҮКТЕУ
#  Логика қарапайым:
#    1. models/best.pt         бар ма? → соны қолдан
#    2. models/helmet_model.pt бар ма? → соны қолдан (ЖҮКТЕУ ЖОҚ!)
#    3. Екеуі де жоқ → БІР РЕТ жүктеп models/-ке сақтайды
#       Келесі жолы 2-қадамнан табылады → ешқашан қайта жүктемейді
# ═══════════════════════════════════════════════════════════════
def ensure_model() -> str:
    # 1. Custom модель (ең жақсы нәтиже)
    if os.path.exists(CUSTOM_MODEL):
        mb = os.path.getsize(CUSTOM_MODEL) / 1024 / 1024
        print(f"✨ Custom модель ({mb:.1f} MB): {CUSTOM_MODEL}")
        return CUSTOM_MODEL

    # 2. Бұрын сақталған модель бар → тікелей қолданамыз, жүктеу жоқ!
    if os.path.exists(HELMET_MODEL):
        mb = os.path.getsize(HELMET_MODEL) / 1024 / 1024
        print(f"📁 Сақталған модель табылды ({mb:.1f} MB)")
        print(f"   Жол: {HELMET_MODEL}")
        print(f"   ✅ Жүктеу жоқ — бірден іске қосылады!")
        return HELMET_MODEL

    # 3. Тек бірінші рет — жүктеп models/ папкасына сақтайды
    print(f"\n📥 Модель бірінші рет жүктелуде...")
    print(f"   Сақталатын жер: {HELMET_MODEL}")
    print(f"   ⏳ Келесі жолы автоматты табылады!\n")
    try:
        YOLO("yolov8n.pt")  # Ultralytics кэшке жүктейді
        # Кэштегі файлды models/ папкасына көшіреміз
        for possible in [
            os.path.join(os.path.expanduser("~"), "AppData", "Roaming", "Ultralytics", "yolov8n.pt"),
            os.path.join(os.path.expanduser("~"), ".config", "Ultralytics", "yolov8n.pt"),
            os.path.join(os.path.expanduser("~"), "Library", "Application Support", "Ultralytics", "yolov8n.pt"),
            "yolov8n.pt",
        ]:
            if os.path.exists(possible) and possible != HELMET_MODEL:
                shutil.copy2(possible, HELMET_MODEL)
                mb = os.path.getsize(HELMET_MODEL) / 1024 / 1024
                print(f"\n✅ Сақталды ({mb:.1f} MB): {HELMET_MODEL}")
                print(f"   Келесі жолы осы жерден тікелей оқылады!\n")
                break
        return HELMET_MODEL
    except Exception as e:
        print(f"⚠️  Жүктеу қатесі: {e}")
        return "yolov8n.pt"


# ═══════════════════════════════════════════════════════════════
#  КЛАСС АНЫҚТАУШЫ
# ═══════════════════════════════════════════════════════════════
def find_helmet_classes(names: dict) -> tuple:
    """
    Модель класс аттарынан helmet / no-helmet ID табады.
    Кез-келген каска моделімен жұмыс жасайды.

    Қайтарады: (helmet_id, no_helmet_id)
      - Екеуі де None болса → жалпы модель (yolov8n), арнайы логика қолданылады
    """
    helmet_words    = {"helmet", "hardhat", "hard hat", "hard-hat",
                       "safety helmet", "with helmet", "wearing helmet"}
    no_helmet_words = {"no helmet", "no hardhat", "no-helmet", "no-hardhat",
                       "no_helmet", "no_hardhat", "without helmet",
                       "without hardhat", "nohelmet", "nohardhat"}

    helmet_id    = None
    no_helmet_id = None

    for cid, name in names.items():
        nl = name.lower().strip()
        if nl in helmet_words:
            helmet_id = cid
        elif nl in no_helmet_words:
            no_helmet_id = cid

    print(f"   Helmet ID    : {helmet_id}  "
          f"('{names.get(helmet_id, '-')}')")
    print(f"   No Helmet ID : {no_helmet_id}  "
          f"('{names.get(no_helmet_id, '-')}')")
    return helmet_id, no_helmet_id


# ═══════════════════════════════════════════════════════════════
#  DETECTOR
# ═══════════════════════════════════════════════════════════════
class SafetyDetector:

    def __init__(self):
        self.model      = None
        self.ready      = False
        self.helmet_id  = None
        self.no_helm_id = None
        self._load()

    def _load(self):
        if not YOLO_AVAILABLE:
            print("⚠️  pip install ultralytics")
            return

        path = ensure_model()
        try:
            self.model = YOLO(path)
            self.ready = True
            self.helmet_id, self.no_helm_id = find_helmet_classes(self.model.names)

            print(f"\n✅ Модель дайын!")
            print(f"   Барлық класстар : {self.model.names}")
            print(f"   Құрылғы         : {DEVICE}")
            print(f"   Helmet шегі     : {HELMET_CONF*100:.0f}%+")
            print(f"   No Helmet шегі  : {NO_HELMET_CONF*100:.0f}%+\n")

            if self.helmet_id is None and self.no_helm_id is None:
                print("   ⚠️  Каска класстары табылмады.")
                print("   💡 models/best.pt ретінде арнайы PPE моделін қойыңыз.\n")

        except Exception as e:
            print(f"❌ Модель жүктелмеді: {e}")

    # ── Bbox + жапсырма салу ───────────────────────────────────
    @staticmethod
    def _draw_box(frame, x1, y1, x2, y2, color, label):
        # Сыртқы жасыл/қызыл жақтау
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

        # Жапсырма фоны
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.65, 2)
        cv2.rectangle(frame,
                      (x1, max(0, y1 - th - 10)),
                      (x1 + tw + 8, y1),
                      color, -1)
        # Жапсырма мәтіні
        cv2.putText(frame, label,
                    (x1 + 4, max(14, y1 - 4)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.65,
                    (255, 255, 255), 2, cv2.LINE_AA)

    def detect(self, frame: np.ndarray, camera_id: str) -> dict:
        if not self.ready:
            return self._pack(frame, [], [])

        results    = self.model(frame, conf=DETECT_CONF, verbose=False)[0]
        detections = []
        incidents  = []
        vis        = frame.copy()

        if results.boxes is None:
            return self._pack(self._overlay(vis, [], []), [], [])

        for box in results.boxes:
            cls_id       = int(box.cls[0])
            conf         = float(box.conf[0])
            x1,y1,x2,y2 = map(int, box.xyxy[0])
            pct          = int(conf * 100)
            class_name   = self.model.names.get(cls_id, f"cls{cls_id}")

            # ════════════════════════════════════════════════════
            #  КАСКА БАР → жасыл box
            # ════════════════════════════════════════════════════
            if cls_id == self.helmet_id:
                if conf < HELMET_CONF:
                    continue   # аз сенімділік → тымақ/бөрік болуы мүмкін
                label  = f"Helmet  {pct}%"
                color  = GREEN
                is_bad = False

            # ════════════════════════════════════════════════════
            #  КАСКА ЖОҚ → қызыл box
            # ════════════════════════════════════════════════════
            elif cls_id == self.no_helm_id:
                if conf < NO_HELMET_CONF:
                    continue
                label  = f"No Helmet  {pct}%"
                color  = RED
                is_bad = True

            # ════════════════════════════════════════════════════
            #  Басқа класстар (жалпы модельде person т.б.)
            # ════════════════════════════════════════════════════
            else:
                # "person" detected -> no helmet (fallback for generic model)
                # This block only runs if no specific helmet model is loaded
                if class_name.lower() in ("person", "worker", "human"):
                    # Тек бас аймағын box-пен белгілейміз (жоғарғы 35%)
                    # person box: x1,y1 → x2,y2  (бүкіл дене)
                    # Бас box:    x1,y1 → x2, y1 + (y2-y1)*0.35
                    head_y2 = int(y1 + (y2 - y1) * 0.35)
                    x1, y2  = x1, head_y2   # box-ты бас аймағына кішірейту
                    label  = f"No Helmet  {pct}%"
                    color  = RED
                    is_bad = True
                else:
                    label  = f"{class_name}  {pct}%"
                    color  = GRAY
                    is_bad = False

            self._draw_box(vis, x1, y1, x2, y2, color, label)

            detections.append({
                "label":        label,
                "class_name":   class_name,
                "confidence":   round(conf, 3),
                "has_helmet":   not is_bad,
                "is_violation": is_bad,
                "bbox":         [x1, y1, x2, y2],
            })

            if is_bad:
                incidents.append({
                    "type":       "Каска жоқ",
                    "severity":   "high",
                    "confidence": pct,
                    "camera":     camera_id,
                    "location":   f"Camera {camera_id}",
                    "timestamp":  datetime.now().isoformat(),
                })

        return self._pack(self._overlay(vis, detections, incidents),
                          detections, incidents)

    # ── Экран үстіндегі мәліметтер ────────────────────────────
    @staticmethod
    def _overlay(frame, detections, incidents=None):
        # Уақыт белгісі ғана (оң жақ төмен)
        ts = datetime.now().strftime("%Y-%m-%d  %H:%M:%S")
        cv2.putText(frame, ts, (10, frame.shape[0] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45,
                    (180, 180, 180), 1, cv2.LINE_AA)
        return frame

    @staticmethod
    def _pack(frame, detections, incidents):
        _, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        return {"frame_bytes": buf.tobytes(),
                "detections":  detections,
                "incidents":   incidents}


# ═══════════════════════════════════════════════════════════════
#  CAMERA
# ═══════════════════════════════════════════════════════════════
class CameraStream:
    def __init__(self, cam_id, source, name=""):
        self.cam_id    = cam_id
        self.source    = source
        self.name      = name or cam_id
        self.cap       = None
        self.frame     = None
        self.connected = False
        self._lock     = threading.Lock()
        self._running  = False

    def start(self) -> bool:
        backend = cv2.CAP_DSHOW if sys.platform == "win32" else cv2.CAP_ANY
        cap     = cv2.VideoCapture(self.source, backend)
        if not cap.isOpened():
            print(f"❌ Камера ашылмады: {self.cam_id}")
            return False
        cap.set(cv2.CAP_PROP_BUFFERSIZE,   1)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH,  1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        cap.set(cv2.CAP_PROP_FPS,          30)
        self.cap, self._running, self.connected = cap, True, True
        threading.Thread(target=self._loop, daemon=True,
                         name=f"cam-{self.cam_id}").start()
        print(f"✅ Камера: {self.cam_id}  [{self.name}]")
        return True

    def stop(self):
        self._running = False
        if self.cap: self.cap.release()
        self.connected = False

    def _loop(self):
        fails = 0
        while self._running:
            ret, frame = self.cap.read()
            if ret:
                with self._lock: self.frame = frame
                fails = 0
            else:
                fails += 1
                if fails > 20: self._reconnect(); fails = 0
                time.sleep(0.03)

    def _reconnect(self):
        print(f"⚠️  {self.cam_id} қайта қосылуда...")
        if self.cap: self.cap.release()
        time.sleep(3)
        backend  = cv2.CAP_DSHOW if sys.platform == "win32" else cv2.CAP_ANY
        self.cap = cv2.VideoCapture(self.source, backend)
        self.connected = self.cap.isOpened()

    def get_frame(self):
        with self._lock:
            return self.frame.copy() if self.frame is not None else None

    def info(self):
        return {"id": self.cam_id, "name": self.name,
                "connected": self.connected, "source": str(self.source)}


class CameraManager:
    def __init__(self):
        self._cams = {}

    def add(self, cam_id, source, name="") -> bool:
        if cam_id in self._cams: self._cams[cam_id].stop()
        src = int(source) if isinstance(source, str) and source.isdigit() else source
        s   = CameraStream(cam_id, src, name)
        ok  = s.start()
        if ok: self._cams[cam_id] = s
        return ok

    def remove(self, cam_id):
        if cam_id in self._cams:
            self._cams[cam_id].stop(); del self._cams[cam_id]

    def get_frame(self, cam_id):
        c = self._cams.get(cam_id)
        return c.get_frame() if c else None

    def all_info(self):
        return [c.info() for c in self._cams.values()]


# ═══════════════════════════════════════════════════════════════
#  FLASK
# ═══════════════════════════════════════════════════════════════
detector        = SafetyDetector()
cam_mgr         = CameraManager()
incidents_store = deque(maxlen=MAX_INCIDENTS)
_cooldowns      = {}
active_cameras  = set()   # тек осы камераларда детекция жазылады

flask_app = Flask(__name__)
CORS(flask_app, origins=["http://localhost:*", "http://127.0.0.1:*"])


def _offline_frame(cam_id):
    img = np.zeros((480, 854, 3), dtype=np.uint8)
    cv2.putText(img, "OFFLINE", (310, 230),
                cv2.FONT_HERSHEY_SIMPLEX, 1.6, (60, 60, 60), 2)
    cv2.putText(img, cam_id, (380, 275),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (50, 50, 50), 1)
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()


def _ok_cooldown(cam_id, typ):
    key = f"{cam_id}_{typ}"
    now = time.time()
    if now - _cooldowns.get(key, 0) < COOLDOWN_SEC: return False
    _cooldowns[key] = now
    return True


def _stream(cam_id):
    interval = 1.0 / MAX_FPS
    while True:
        t0  = time.time()
        raw = cam_mgr.get_frame(cam_id)

        if raw is None:
            jpg = _offline_frame(cam_id)
        else:
            res = detector.detect(raw, cam_id)
            jpg = res["frame_bytes"]
            # Тек активті (қосулы) камерада оқиғалар тіркеледі
            if cam_id in active_cameras:
                for inc in res["incidents"]:
                    if not _ok_cooldown(cam_id, inc["type"]): continue
                    import base64
                    snapshot_b64 = "data:image/jpeg;base64," + base64.b64encode(jpg).decode("utf-8")
                    inc.update({
                        "id":           f"AI-{int(time.time()*1000)}",
                        "date":         datetime.now().strftime("%Y-%m-%d %H:%M"),
                        "status":       "Open",
                        "note":         f"AI auto-detected • {inc['confidence']}%",
                        "snapshot_b64": snapshot_b64,
                    })
                    incidents_store.appendleft(inc)

        yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + jpg + b"\r\n")
        time.sleep(max(0.0, interval - (time.time() - t0)))


@flask_app.get("/")
def root():
    return jsonify({
        "service":      "ҚауіпсіздікКөзі v5.0",
        "model_ready":  detector.ready,
        "helmet_class": detector.helmet_id,
        "classes":      detector.model.names if detector.ready else {},
        "cameras":      len(cam_mgr.all_info()),
        "incidents":    len(incidents_store),
    })

@flask_app.get("/video/<cam_id>")
def video(cam_id):
    return Response(_stream(cam_id),
                    mimetype="multipart/x-mixed-replace; boundary=frame")

@flask_app.get("/api/cameras")
def cameras():
    return jsonify({"cameras": cam_mgr.all_info()})

@flask_app.post("/api/cameras/add")
def add_cam():
    b  = request.get_json(force=True)
    cam_id = b.get("id", "")
    ok = cam_mgr.add(cam_id, b.get("source", ""), b.get("name", ""))
    if ok:
        active_cameras.add(cam_id)   # қосылды → детекция белсенді
    return jsonify({"ok": ok}), (200 if ok else 400)

@flask_app.post("/api/cameras/remove")
def rem_cam():
    cam_id = request.get_json(force=True).get("id", "")
    cam_mgr.remove(cam_id)
    active_cameras.discard(cam_id)   # өшірілді → детекция тоқтайды
    return jsonify({"ok": True})

@flask_app.post("/api/cameras/activate")
def activate_cam():
    cam_id = request.get_json(force=True).get("id", "")
    active_cameras.add(cam_id)
    return jsonify({"ok": True, "active": list(active_cameras)})

@flask_app.post("/api/cameras/deactivate")
def deactivate_cam():
    cam_id = request.get_json(force=True).get("id", "")
    active_cameras.discard(cam_id)
    return jsonify({"ok": True, "active": list(active_cameras)})

@flask_app.get("/api/incidents")
def get_inc():
    lim = int(request.args.get("limit", 100))
    return jsonify({"incidents": list(incidents_store)[:lim],
                    "total":     len(incidents_store)})

@flask_app.get("/api/incidents/<inc_id>")
def get_one_inc(inc_id):
    for inc in incidents_store:
        if inc.get("id") == inc_id:
            return jsonify(inc)
    return jsonify({"error": "not found"}), 404

@flask_app.patch("/api/incidents/<inc_id>")
def patch_inc(inc_id):
    data = request.get_json(force=True)
    for inc in incidents_store:
        if inc.get("id") == inc_id:
            inc.update(data)
            return jsonify({"ok": True})
    return jsonify({"error": "not found"}), 404

@flask_app.delete("/api/incidents/<inc_id>")
def del_one_inc(inc_id):
    global incidents_store
    new_store = deque((x for x in incidents_store if x.get("id") != inc_id), maxlen=MAX_INCIDENTS)
    incidents_store.clear()
    incidents_store.extend(new_store)
    return jsonify({"ok": True})

@flask_app.delete("/api/incidents")
def clr_inc():
    incidents_store.clear(); _cooldowns.clear()
    return jsonify({"ok": True})

@flask_app.get("/api/model/info")
def model_info():
    if not detector.ready:
        return jsonify({"ready": False})
    return jsonify({
        "ready":       True,
        "model_path":  HELMET_MODEL,
        "classes":     detector.model.names,
        "helmet_id":   detector.helmet_id,
        "no_helmet_id": detector.no_helm_id,
        "thresholds":  {
            "helmet":    HELMET_CONF,
            "no_helmet": NO_HELMET_CONF,
        },
    })


# ═══════════════════════════════════════════════════════════════
#  START
# ═══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("\n" + "═"*55)
    print("  ҚауіпсіздікКөзі — Каска Анықтау  v5.0")
    print("═"*55)
    print(f"  Stream   → http://localhost:{PORT}/video/CAM-01")
    print(f"  API info → http://localhost:{PORT}/api/model/info")
    print("─"*55)
    print(f"  📁 Модель сақталатын жер:")
    print(f"     {HELMET_MODEL}")
    print(f"  ✨ Custom модель (ең жақсы нәтиже):")
    print(f"     {CUSTOM_MODEL}")
    print("─"*55)
    print("  🎨 Нәтиже:")
    print("     Каска БАР  → 🟢 жасыл box  + 'Helmet'")
    print("     Каска ЖОҚ  → 🔴 қызыл box  + 'No Helmet'")
    print("═"*55 + "\n")

    for cam in DEFAULT_CAMERAS:
        cam_mgr.add(cam["id"], cam["source"], cam["name"])
        # active_cameras-қа қоспаймыз — қолмен қосқанда ғана тіркеледі

    flask_app.run(host=HOST, port=PORT, debug=False, threaded=True)
