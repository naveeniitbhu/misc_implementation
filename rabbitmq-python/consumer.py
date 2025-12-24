import pika

# 1. Connect
connection = pika.BlockingConnection(
    pika.ConnectionParameters(
        host="localhost",
    )
)

# 2. Channel
channel = connection.channel()

# 3. Same queue
queue_name = "task_queue"
channel.queue_declare(queue=queue_name)

print("📥 Waiting for messages... Press CTRL+C to exit")


def callback(ch, method, properties, body):
    print(f"Received: {body.decode()}")
    ch.basic_ack(delivery_tag=method.delivery_tag)


channel.basic_consume(queue=queue_name, on_message_callback=callback)

channel.start_consuming()
