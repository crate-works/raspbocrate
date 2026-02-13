# NOTE: We build our own image becasue the official ones don't work on the Raspberry Pi 4
FROM ubuntu:24.04

ARG OPENSEARCH_VERSION=3.5.0
ARG TARGETARCH

RUN apt-get update && \
  apt-get install -y --no-install-recommends curl ca-certificates && \
  rm -rf /var/lib/apt/lists/*

RUN groupadd -g 1001 opensearch && \
  useradd -u 1001 -g 1001 -d /usr/share/opensearch opensearch

RUN ARCH=$(if [ "$TARGETARCH" = "arm64" ]; then echo "linux-arm64"; else echo "linux-x64"; fi) && \
  curl -fsSL "https://artifacts.opensearch.org/releases/bundle/opensearch/${OPENSEARCH_VERSION}/opensearch-${OPENSEARCH_VERSION}-${ARCH}.tar.gz" \
  -o /tmp/opensearch.tar.gz && \
  mkdir -p /usr/share/opensearch && \
  tar -xzf /tmp/opensearch.tar.gz --strip-components=1 -C /usr/share/opensearch && \
  rm /tmp/opensearch.tar.gz

RUN printf '\nplugins.security.disabled: true\ndiscovery.type: single-node\nnetwork.host: 0.0.0.0\n' \
  >> /usr/share/opensearch/config/opensearch.yml

RUN mkdir -p /usr/share/opensearch/data && \
  chown -R opensearch:opensearch /usr/share/opensearch

VOLUME /usr/share/opensearch/data

ENV DISABLE_SECURITY_PLUGIN=true
ENV OPENSEARCH_JAVA_OPTS="-Xms512m -Xmx512m"
ENV discovery.type=single-node

USER opensearch
WORKDIR /usr/share/opensearch

EXPOSE 9200 9600

ENTRYPOINT ["./bin/opensearch"]
