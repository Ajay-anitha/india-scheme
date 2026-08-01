import urllib.request
import json
import sys

# Ensure UTF-8 output encoding for terminal
sys.stdout.reconfigure(encoding='utf-8')

base_url = 'http://127.0.0.1:8000'

def get_json(url):
    req = urllib.request.urlopen(url)
    return json.loads(req.read().decode('utf-8'))

def post_json(url, data):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    return json.loads(res.read().decode('utf-8'))

print("==================================================")
print("  AI GOVERNMENT SCHEME ASSISTANT - LIVE TEST RUN  ")
print("==================================================\n")

print("=== 1. Health Check (GET /) ===")
print(json.dumps(get_json(base_url + '/'), indent=2))

print("\n=== 2. List Schemes (GET /schemes) ===")
schemes_res = get_json(base_url + '/schemes')
print(f"Status: {schemes_res['status']} | Total Count: {schemes_res['count']}")
print("Sample Scheme:")
print(json.dumps(schemes_res['schemes'][0], indent=2, ensure_ascii=False))

print("\n=== 3. Search Schemes (GET /schemes?q=Kisan) ===")
search_res = get_json(base_url + '/schemes?q=Kisan')
print(f"Matching Schemes Found: {search_res['count']}")
for s in search_res['schemes']:
    print(f" * {s['scheme_name']} ({s['ministry']})")

print("\n=== 4. Scheme Details by ID (GET /scheme/1) ===")
single_res = get_json(base_url + '/scheme/1')
print(json.dumps(single_res['scheme'], indent=2, ensure_ascii=False))

print("\n=== 5. Check Eligibility (POST /eligibility) ===")
elig_data = {
    'age': 25,
    'gender': 'Male',
    'state': 'Maharashtra',
    'occupation': 'Farmer',
    'annual_income': 150000,
    'category': 'General'
}
elig_res = post_json(base_url + '/eligibility', elig_data)
print(f"Matched Schemes Count: {elig_res['total_matched']}")
for s in elig_res['schemes']:
    print(f" * {s['scheme_name']}")
    print(f"   Benefits: {s['benefits']}")
    print(f"   Apply Link: {s['apply_link']}")

print("\n=== 6. AI Chat Assistant (POST /chat) ===")
chat_data = {'message': 'What documents do I need for PM Kisan Samman Nidhi?'}
chat_res = post_json(base_url + '/chat', chat_data)
print("AI Assistant Reply:")
print(chat_res['reply'])
print("\n==================================================")
print("  ALL API ENDPOINTS WORKING PERFECTLY & LIVE!     ")
print("==================================================")
