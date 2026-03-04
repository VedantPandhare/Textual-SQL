import requests
import os

API_BASE = "http://localhost:8000"

def test_csv_import():
    csv_content = "id,name,email\n1,John Doe,john@example.com\n2,Jane Smith,jane@example.com"
    with open("test.csv", "w") as f:
        f.write(csv_content)
    
    print("Testing CSV import...")
    with open("test.csv", "rb") as f:
        response = requests.post(f"{API_BASE}/import", files={"file": ("test_data.csv", f)})
    
    print(f"Response: {response.status_code}")
    print(response.json())
    os.remove("test.csv")

if __name__ == "__main__":
    try:
        test_csv_import()
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure the backend is running at http://localhost:8000")
