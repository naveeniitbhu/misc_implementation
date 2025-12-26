const express = require('express');
const redis = require('./redisClient');

const app = express();

app.use(express.json());

const pg = require('knex')({
  client: 'pg',
  connection: {
    host: 'localhost',
    port: 5400,
    user: 'postgres',
    database: 'circuitBreaker',
    password: 'postgres',
    ssl: false,
  },
});

pg.raw('select 1')
  .then(() => console.log('DB connected'))
  .catch(() => process.exit(1));

const TTL = 10; // seconds
// const FAILURE_THRESHOLD = 3;

async function getCircuitState(service) {
  const data = await redis.get(`cb:${service}`);
  return data ? JSON.parse(data) : null;
}

async function setCircuitState(service, state) {
  await redis.set(
    `cb:${service}`,
    JSON.stringify(state),
    { EX: TTL }
  );
}

app.get('/orders/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const order = await pg('orders').where({ id }).first();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch {
    res.status(500).json({ message: 'DB error' });
  }
});

app.post('/orders', async (req, res) => {
  const { user_id, amount } = req.body;

  const service = 'user-service';

  let state = await getCircuitState(service);
  setCircuitState(service, { is_up: !state.is_up });
  console.log(state)

  if (state && !state.is_up) {
    return res.status(503).json({ message: 'Circuit OPEN for user-service' });
  }

  const userRes = await fetch(`http://localhost:3000/users/${user_id}`);

  if (!userRes.ok) {
    return res.status(502).json({ message: 'User lookup failed' });
  }

  if (!user_id || !amount) {
    return res.status(400).json({ message: 'user_id and amount required' });
  }

  try {
    const [order] = await pg('orders')
      .insert({ user_id, amount })
      .returning('*');

    res.status(201).json(order);
  } catch {
    res.status(500).json({ message: 'DB error' });
  }
});

app.listen(3001, () => console.log('Order service on 3001'));
