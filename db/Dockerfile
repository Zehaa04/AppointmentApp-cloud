FROM amazonlinux:2023

RUN yum update -y && \
    yum install -y postgresql15-server postgresql15 && \
    yum clean all

ENV POSTGRES_DB=postgres
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres

RUN /usr/bin/postgresql-15-setup initdb

EXPOSE 5432

CMD ["/usr/bin/postgres", "-D", "/var/lib/pgsql/15/data"]