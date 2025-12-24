import redis

r = redis.Redis(host="localhost", port="6379", decode_responses=True)

pubsub = r.pubsub()
pubsub.subscribe("news")

print("Subscribed to news. Waiting for messages...")

for msg in pubsub.listen():
    if msg["type"] == "message":
        print(f"Received: {msg['data']}")
