## redis-python

This projects compares the avg write and read time between redis and postgres.
For more info, please check the README of the project.

# Commands

python3 -m venv .venv
source .venv/bin/activate

pip install redis
pip install "psycopg[binary]"

which python
which pip

Redis - Set time: 0.090ms
Redis - Get time: 0.081ms
Average write time: 0.444ms
Avg PG READ time: 0.1873 ms
