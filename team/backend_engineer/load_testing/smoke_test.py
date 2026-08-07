"""Smoke test simulator driving full interview lifecycle."""
import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8000"


def run_smoke_test():
    print("=== Running Backend Smoke Test ===")
    
    # 1. Healthcheck
    try:
        with urllib.request.urlopen(f"{BASE_URL}/health") as response:
            data = json.loads(response.read().decode())
            print(f"[*] Healthcheck status: {data.get('status')}")
    except Exception as e:
        print(f"[!] Healthcheck failed (Is the server running?): {e}")
        return

    # 2. Init session
    init_data = json.dumps({
        "sessionId": "smoke_sess_001",
        "candidate": {
            "id": "cand_001",
            "name": "Sarah Chen"
        }
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{BASE_URL}/api/interview",
        data=init_data,
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req) as response:
            res_body = json.loads(response.read().decode())
            print(f"[*] Init response reply: {res_body.get('reply')[:60]}...")
            print("[✓] Smoke test succeeded!")
    except Exception as e:
        print(f"[!] Session init failed: {e}")


if __name__ == "__main__":
    run_smoke_test()
