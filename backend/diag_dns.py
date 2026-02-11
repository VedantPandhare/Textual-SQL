import socket
try:
    import psycopg2
except ImportError:
    psycopg2 = None

hosts = [
    "db.yedvxjptltirkwgtvehp.supabase.co",
    "aws-1-ap-northeast-1.pooler.supabase.com",
    "aws-0-ap-northeast-1.pooler.supabase.com"
]

print("--- Multi-Host Diagnosis ---")

for host in hosts:
    print(f"\n>> Checking: {host}")
    try:
        ipv4 = socket.gethostbyname(host)
        print(f"   IPv4: {ipv4}")
    except Exception as e:
        print(f"   IPv4 Error: {e}")

    try:
        res_info = socket.getaddrinfo(host, 5432)
        for res in res_info:
            family = "IPv4" if res[0] == socket.AF_INET else "IPv6" if res[0] == socket.AF_INET6 else res[0]
            print(f"   Address: {family} -> {res[4][0]}")
    except Exception as e:
        print(f"   AddrInfo Error: {e}")

print("\n--- Done ---")
