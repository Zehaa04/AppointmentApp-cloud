#!/bin/bash
set -e

if [ -f "$PGDATA/postmaster.pid" ]; then
    echo "Removing stale postmaster.pid..."
    rm -f "$PGDATA/postmaster.pid"
fi

if [ ! -s "$PGDATA/PG_VERSION" ]; then
    echo "Initializing PostgreSQL database..."
    /usr/bin/initdb -D "$PGDATA"

    echo "listen_addresses = '*'" >> "$PGDATA/postgresql.conf"
    echo "host    all             all             0.0.0.0/0            trust" >> "$PGDATA/pg_hba.conf"

    echo "Starting PostgreSQL in the background for initialization..."
    /usr/bin/pg_ctl -D "$PGDATA" -w start

    echo "Running init scripts..."
    for f in /docker-entrypoint-initdb.d/*.sql; do
        echo "Running $f..."
        psql -v ON_ERROR_STOP=1 -U postgres -f "$f"
    done

    echo "Stopping PostgreSQL after initialization..."
    /usr/bin/pg_ctl -D "$PGDATA" -m fast -w stop
fi

echo "Starting PostgreSQL..."
exec /usr/bin/postgres -D "$PGDATA"
