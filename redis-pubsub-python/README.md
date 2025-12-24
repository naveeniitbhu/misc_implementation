# Redis Pub Sub

Publisher → sends messages
Channel → topic name (string)
Subscriber → listens to messages on that channel
Messages are not stored (they are transient)
If you’re not listening at the time → you miss the message
