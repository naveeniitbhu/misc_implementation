# latest RabbitMQ 4.x

docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management

pip install pika

python producer.py
python consumer.py

Unacked: deliver to a consumer but not yet acknowledged
GUI: http://localhost:15672
username:password = guest:guest
