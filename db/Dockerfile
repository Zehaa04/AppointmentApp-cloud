# Use Amazon Linux 2023 as the base image
FROM amazonlinux:2023

# Set the location where PostgreSQL will store its data
ENV PGDATA=/var/lib/postgresql/data

# Install PostgreSQL 15 server and some useful tools
RUN yum update -y && \
    yum install -y postgresql15-server postgresql15 sudo procps which && \
    yum clean all

# Create the data directory and set ownership to the postgres UID (26)
RUN mkdir -p "$PGDATA" && \
    chown -R 26:26 "$PGDATA"

# Copy initialization SQL script (runs on first container startup)
COPY init.sql /docker-entrypoint-initdb.d/

# Copy custom entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Run the container as the postgres user
USER postgres

# Expose PostgreSQL default port
EXPOSE 5432

# Run the custom entrypoint script when the container starts
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
