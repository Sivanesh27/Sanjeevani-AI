import urllib.request
import json
import ssl

BASE_URL = "https://sivaneshakumar-sanjeevani-backend.hf.space"
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def test_endpoint(name: str, path: str, method: str = "GET", body: dict = None):
    url = f"{BASE_URL}{path}"
    print(f"\n[TEST] {name} -> {path}")
    try:
        data = json.dumps(body).encode("utf-8") if body else None
        headers = {
            "User-Agent": "Mozilla/5.0",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=30, context=ctx) as response:
            res_code = response.status
            res_body = response.read().decode("utf-8")
            try:
                parsed = json.loads(res_body)
                print(f"  Result: {res_code} OK (JSON Response Received)")
                print(f"  Preview: {json.dumps(parsed, indent=2)[:300]}...")
                return True
            except Exception:
                print(f"  Result: {res_code} OK (HTML/Text received, length: {len(res_body)})")
                return True
    except Exception as e:
        print(f"  Result: Error ({e})")
        return False

def main():
    print("=" * 65)
    print("SanjeevaniAI - Live Hugging Face Backend Health & API Verification")
    print(f"Target URL: {BASE_URL}")
    print("=" * 65)

    test_endpoint("1. Health Check", "/api/v1/health")
    test_endpoint("2. Database & ML Model Readiness", "/api/v1/ready")
    test_endpoint("3. RoBERTa Model Information", "/api/v1/ner/info")
    test_endpoint(
        "4. Live Neural NER Inference",
        "/api/v1/ner/analyze",
        method="POST",
        body={"text": "Patient was prescribed Metformin 500mg daily for diabetes mellitus."}
    )
    test_endpoint(
        "5. Clinical AI Assistant Chat",
        "/api/v1/chat",
        method="POST",
        body={"message": "What is Metformin used for?"}
    )
    test_endpoint("6. OpenAPI / Swagger Documentation", "/docs")

    print("\n" + "=" * 65)

if __name__ == "__main__":
    main()
