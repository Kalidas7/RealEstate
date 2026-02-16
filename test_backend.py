import requests
import json

API_URL = "http://192.168.1.11:8000/api"

print("Testing Django API Endpoints...")
print("=" * 50)

# Test 1: Check Email
print("\n1. Testing check-email endpoint...")
try:
    response = requests.post(
        f"{API_URL}/check-email/",
        json={"email": "test@example.com"},
        timeout=5
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:200]}")
    if response.status_code == 200:
        print("✅ Check-email endpoint working!")
    else:
        print("❌ Check-email endpoint returned error")
except Exception as e:
    print(f"❌ Error connecting to check-email: {e}")

# Test 2: Properties
print("\n2. Testing properties endpoint...")
try:
    response = requests.get(
        f"{API_URL}/properties/",
        timeout=5
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:200]}")
    if response.status_code == 200:
        print("✅ Properties endpoint working!")
    else:
        print("❌ Properties endpoint returned error")
except Exception as e:
    print(f"❌ Error connecting to properties: {e}")

print("\n" + "=" * 50)
print("API Test Complete")
