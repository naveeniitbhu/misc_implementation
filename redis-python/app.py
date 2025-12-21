import time
import redis
import psycopg


try:
  conn = psycopg.connect(
    host="localhost",
    port=5400,
    dbname="testDB-redis",
    user="postgres",
    password="postgres"
  )
  print("Database connected")
except OperationalError as e:
  print("Database connection failed")
  print("Error:", e)
  exit(1)

try:
  r = redis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True 
    # “Automatically convert Redis byte responses into Python strings.”
  )
  r.ping()
  print("Redus connected")
except Exception as e:
  print("Redis error:", e)


N = 100
start = time.perf_counter()
for i in range(N):
  r.set(f"key:{i}",i)
end = time.perf_counter()
set_time_ms = (end-start)*1000/N

start = time.perf_counter()
for i in range(N):
  r.get(f"key:{i}")
end = time.perf_counter()
get_time_ms = (end-start)*1000/N

print(f"Redis - Set time: {set_time_ms:.3f}ms")
print(f"Redis - Get time: {get_time_ms:.3f}ms")

start = time.perf_counter()
with conn.cursor() as cur:
  for i in range(N):
    cur.execute(
      """
      INSERT INTO kv_test(key, value) values (%s, %s) ON CONFLICT (key) 
      DO UPDATE SET value = EXCLUDED.value
      """, (f"key:{i}", i)
    )
end = time.perf_counter()
avg_write_ms = (end-start)*1000/N

start = time.perf_counter()
with conn.cursor() as cur:
  for i in range(N):
    cur.execute(
      """
      SELECT value from kv_test where key=%s
      """, (f"key:{i}",)
    )
    cur.fetchone()

end = time.perf_counter()
avg_read_ms = (end - start) * 1000 / N

print(f"Average write time: {avg_write_ms:.3f}ms")
print(f"Avg PG READ time: {avg_read_ms:.4f} ms")

conn.close()