"""
download_model.py — Каска анықтайтын нақты модельді жүктеу
══════════════════════════════════════════════════════════
Іске қосу:
    python download_model.py

Не жүктейді:
    keremberke/helmet-detection-yolov8 моделі
    - Класстары: "Helmet", "NO-Helmet"
    - 5000+ өнеркәсіп суреттерінде жаттықтырылған
    - Тымақ/бөрікті каска деп шатастырмайды
"""

import os
import sys
import urllib.request

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

SAVE_PATH = os.path.join(MODELS_DIR, "helmet_model.pt")

# ── Жүктейтін модельдер тізімі (жоғарыдан → төменге) ─────────
# Бірінші табылғаны жүктеледі
SOURCES = [
    # 1. GitHub-тан тікелей (ең сенімді)
    (
        "https://github.com/keremberke/awesome-yolov8-models/releases/download/v1.0.0/best.pt",
        "keremberke helmet-detection v1.0"
    ),
    # 2. HuggingFace
    (
        "https://huggingface.co/keremberke/yolov8m-hard-hat-detection/resolve/main/best.pt",
        "HuggingFace yolov8m-hard-hat"
    ),
]


def progress(count, block_size, total_size):
    if total_size > 0:
        pct  = count * block_size * 100 // total_size
        done = pct // 2
        bar  = "█" * done + "░" * (50 - done)
        print(f"\r   [{bar}] {pct}%", end="", flush=True)


def download():
    # Бұрын жүктелген болса — қайта жүктемейміз
    if os.path.exists(SAVE_PATH):
        mb = os.path.getsize(SAVE_PATH) / 1024 / 1024
        print(f"✅ Модель бұрыннан бар ({mb:.1f} MB):")
        print(f"   {SAVE_PATH}")
        print(f"\napp.py іске қосыңыз: python app.py")
        return True

    print("═" * 55)
    print("  Каска анықтайтын модель жүктелуде...")
    print("═" * 55)

    for url, label in SOURCES:
        print(f"\n📥 Көз: {label}")
        print(f"   URL: {url}")
        try:
            urllib.request.urlretrieve(url, SAVE_PATH, reporthook=progress)
            print()  # жол ауыстыру
            mb = os.path.getsize(SAVE_PATH) / 1024 / 1024

            # Файл тым кішкентай болса — қате жүктелген
            if mb < 1.0:
                print(f"   ⚠️  Файл тым кішкентай ({mb:.2f} MB) — өткізіп жіберемін")
                os.remove(SAVE_PATH)
                continue

            print(f"\n✅ Жүктелді! ({mb:.1f} MB)")
            print(f"   Сақталды: {SAVE_PATH}")
            print(f"\n🚀 Енді іске қосыңыз:")
            print(f"   python app.py")
            return True

        except Exception as e:
            print(f"\n   ⚠️  Қате: {e}")
            if os.path.exists(SAVE_PATH):
                os.remove(SAVE_PATH)
            continue

    # Барлық сілтемелер сәтсіз болса — Ultralytics-тен жүктейміз
    print("\n⚠️  Интернет сілтемелері сәтсіз болды.")
    print("📥 Ultralytics-тен жалпы модель жүктелуде...")
    print("   (Бұл модельде helmet класы болмауы мүмкін)")
    try:
        from ultralytics import YOLO
        import shutil

        model = YOLO("yolov8n.pt")

        # Кэштен models/-ке көшір
        cache_paths = [
            os.path.join(os.path.expanduser("~"), "AppData", "Roaming", "Ultralytics", "yolov8n.pt"),
            os.path.join(os.path.expanduser("~"), ".config", "Ultralytics", "yolov8n.pt"),
            "yolov8n.pt",
        ]
        for src in cache_paths:
            if os.path.exists(src) and src != SAVE_PATH:
                shutil.copy2(src, SAVE_PATH)
                mb = os.path.getsize(SAVE_PATH) / 1024 / 1024
                print(f"✅ Сақталды ({mb:.1f} MB): {SAVE_PATH}")
                break

        print("\n⚠️  МАҢЫЗДЫ: Бұл жалпы модель.")
        print("   Каска/No-Helmet дұрыс анықтау үшін:")
        print("   https://universe.roboflow.com іздеу: 'helmet detection yolov8'")
        print("   best.pt жүктеп → models/helmet_model.pt деп атаңыз")
        return True

    except Exception as e:
        print(f"❌ Жүктеу сәтсіз: {e}")
        return False


if __name__ == "__main__":
    success = download()
    sys.exit(0 if success else 1)
