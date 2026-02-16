# NOTE: We build our own image becasue the official ones don't work on the Raspberry Pi 4
FROM ubuntu:24.04

ARG OPENSEARCH_VERSION=3.5.0
ARG TARGETARCH

RUN apt-get update && \
  apt-get install -y --no-install-recommends curl ca-certificates && \
  rm -rf /var/lib/apt/lists/*

RUN groupadd -g 1001 opensearch && \
  useradd -u 1001 -g 1001 -d /usr/share/opensearch opensearch

# Download, extract, remove unused plugins, configure, and chown in a single layer.
# Keep: opensearch-geospatial, opensearch-job-scheduler (geospatial dependency).
# Remove dependents before their dependencies to avoid removal errors.
RUN ARCH=$(if [ "$TARGETARCH" = "arm64" ]; then echo "linux-arm64"; else echo "linux-x64"; fi) && \
  curl -fsSL "https://artifacts.opensearch.org/releases/bundle/opensearch/${OPENSEARCH_VERSION}/opensearch-${OPENSEARCH_VERSION}-${ARCH}.tar.gz" \
  -o /tmp/opensearch.tar.gz && \
  mkdir -p /usr/share/opensearch && \
  tar -xzf /tmp/opensearch.tar.gz --strip-components=1 -C /usr/share/opensearch && \
  mkdir -p /usr/share/opensearch/data && \
  rm /tmp/opensearch.tar.gz && \
  cd /usr/share/opensearch && \
  bin/opensearch-plugin remove opensearch-security-analytics && \
  bin/opensearch-plugin remove opensearch-alerting && \
  bin/opensearch-plugin remove opensearch-anomaly-detection && \
  bin/opensearch-plugin remove opensearch-flow-framework && \
  bin/opensearch-plugin remove opensearch-neural-search && \
  bin/opensearch-plugin remove opensearch-skills && \
  bin/opensearch-plugin remove opensearch-notifications && \
  bin/opensearch-plugin remove opensearch-reports-scheduler && \
  bin/opensearch-plugin remove opensearch-search-relevance && \
  bin/opensearch-plugin remove opensearch-index-management && \
  bin/opensearch-plugin remove opensearch-sql && \
  bin/opensearch-plugin remove opensearch-knn && \
  bin/opensearch-plugin remove opensearch-ml && \
  bin/opensearch-plugin remove opensearch-notifications-core && \
  bin/opensearch-plugin remove opensearch-asynchronous-search && \
  bin/opensearch-plugin remove opensearch-cross-cluster-replication && \
  bin/opensearch-plugin remove opensearch-custom-codecs && \
  bin/opensearch-plugin remove opensearch-ltr && \
  bin/opensearch-plugin remove opensearch-observability && \
  bin/opensearch-plugin remove opensearch-performance-analyzer && \
  bin/opensearch-plugin remove opensearch-security && \
  bin/opensearch-plugin remove opensearch-system-templates && \
  bin/opensearch-plugin remove opensearch-ubi && \
  bin/opensearch-plugin remove query-insights && \
  printf '\ndiscovery.type: single-node\nnetwork.host: 0.0.0.0\n' \
    >> config/opensearch.yml && \
  chown -R opensearch:opensearch /usr/share/opensearch

VOLUME /usr/share/opensearch/data

ENV OPENSEARCH_JAVA_OPTS="-Xms256m -Xmx256m"
ENV discovery.type=single-node

USER opensearch
WORKDIR /usr/share/opensearch

EXPOSE 9200 9600

ENTRYPOINT ["./bin/opensearch"]
