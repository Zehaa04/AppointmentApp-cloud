FROM amazonlinux:2023

RUN yum update -y && \
    yum install -y haproxy && \
    yum clean all

COPY haproxy.cfg /etc/haproxy/haproxy.cfg

EXPOSE 80

CMD ["haproxy", "-f", "/etc/haproxy/haproxy.cfg", "-db"]
