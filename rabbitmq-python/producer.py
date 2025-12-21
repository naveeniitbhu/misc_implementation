import pika

connection = pika.BlockingConnection(
  pika.ConnectionParameters(host="localhost")
)

channel = connection.channel()

# Declare queue
queue_name = 'task_queue'
channel.queue_declare(queue_name)

# Publish message
message = "Hello rabbitmq from python"
channel.basic_publish(
  exchange='',
  routing_key=queue_name,
  body=message
)
print(f"publish message sent")
connection.close()

