FROM amazonlinux:2023

ENV PGDATA=/var/lib/postgresql/data

RUN yum update -y && \
    yum install -y postgresql15-server postgresql15 sudo procps which && \
    yum clean all

RUN mkdir -p "$PGDATA" && \
    chown -R 26:26 "$PGDATA"   

COPY init.sql /docker-entrypoint-initdb.d/
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER postgres
EXPOSE 5432
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
