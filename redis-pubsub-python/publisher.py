import redis
import time

r = redis.Redis(host="localhost", port="6379", decode_responses=True)

messages = ["Hello", "Breaking News", "Redis Pub/Sub Test"]

for msg in messages:
    receivers = r.publish("news", msg)
    print(f"Published '{msg}' -> delivered to {receivers} subscribers")
    time.sleep(2)
