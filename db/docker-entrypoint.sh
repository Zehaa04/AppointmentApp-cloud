#!/bin/bash
set -e  # exit immediately if a command fails

# Remove stale PID file if it exists (can happen if container was stopped improperly)
if [ -f "$PGDATA/postmaster.pid" ]; then
    echo "Removing stale postmaster.pid..."
    rm -f "$PGDATA/postmaster.pid"
fi

# Only initialize the database if it hasn’t been set up yet
if [ ! -s "$PGDATA/PG_VERSION" ]; then
    echo "Initializing PostgreSQL database..."
    /usr/bin/initdb -D "$PGDATA"

    # Allow connections from all hosts (trust auth - not secure for prod!)
    echo "listen_addresses = '*'" >> "$PGDATA/postgresql.conf"
    echo "host    all             all             0.0.0.0/0            trust" >> "$PGDATA/pg_hba.conf"

    # Start PostgreSQL temporarily in the background
    echo "Starting PostgreSQL in the background for initialization..."
    /usr/bin/pg_ctl -D "$PGDATA" -w start

    # Run all SQL scripts in the init directory
    echo "Running init scripts..."
    for f in /docker-entrypoint-initdb.d/*.sql; do
        echo "Running $f..."
        psql -v ON_ERROR_STOP=1 -U postgres -f "$f"
    done

    # Stop PostgreSQL after running init scripts
    echo "Stopping PostgreSQL after initialization..."
    /usr/bin/pg_ctl -D "$PGDATA" -m fast -w stop
fi

# Start PostgreSQL normally in the foreground
echo "Starting PostgreSQL..."
exec /usr/bin/postgres -D "$PGDATA"
