FROM amazonlinux:2023

ENV PGDATA=/var/lib/pgsql/15/data

RUN yum update -y && \
    yum install -y postgresql15-server postgresql15 sudo procps which && \
    yum clean all

RUN mkdir -p "$PGDATA" && \
    chown -R postgres:postgres /var/lib/pgsql


COPY init.sql /docker-entrypoint-initdb.d/
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER postgres
EXPOSE 5432
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
