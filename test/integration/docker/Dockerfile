FROM ubuntu:20.04

# Install rsyslog
RUN apt-get update && apt-get install -y rsyslog && rm -rf /var/lib/apt/lists/*

# Copy the custom rsyslog configuration
COPY rsyslog.conf /etc/rsyslog.conf

# Expose syslog ports for UDP and TCP
EXPOSE 514/udp 514/tcp

# Start rsyslog in the foreground
CMD ["rsyslogd", "-n"]
