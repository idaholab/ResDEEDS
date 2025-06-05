# Build stage
FROM python:3.12-slim AS builder

WORKDIR /build

# Configure INL certs
ADD http://certstore.inl.gov/pki/CAINLROOT_B64.crt /usr/local/share/ca-certificates/
RUN apt-get update \
    && apt-get install -y ca-certificates \
    && /usr/sbin/update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt \
    REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    CURL_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_DIR=/etc/ssl/certs/

# Install build dependencies
RUN apt-get update \
    && apt-get install -y build-essential cargo \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Set uv environment variables for production
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_NO_CACHE=1

# Install production dependencies only
RUN uv sync --no-dev --locked

# Copy source code
COPY . .

# Production stage
FROM python:3.12-slim

WORKDIR /var/www

# Create non-root user with home directory
RUN groupadd -r appuser && useradd -r -g appuser -m -d /home/appuser appuser

# Copy certificates from builder
COPY --from=builder /usr/local/share/ca-certificates/ /usr/local/share/ca-certificates/
RUN apt-get update \
    && apt-get install -y ca-certificates \
    && /usr/sbin/update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt \
    REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    CURL_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_DIR=/etc/ssl/certs/ \
    DEBUG=0 \
    PORT=5000 \
    UV_CACHE_DIR=/var/www/.cache/uv \
    PATH="/var/www/.venv/bin:$PATH"

# Create cache directory for uv
RUN mkdir -p /var/www/.cache/uv && chown -R appuser:appuser /var/www/.cache

# Copy only necessary files from builder
COPY --from=builder --chown=appuser:appuser /build/.venv /var/www/.venv
COPY --from=builder --chown=appuser:appuser /build/src /var/www/src
COPY --from=builder --chown=appuser:appuser /build/pyproject.toml /build/uv.lock /var/www/
COPY --from=builder /bin/uv /bin/uv

# Switch to non-root user
USER appuser

EXPOSE 5000

CMD ["/var/www/.venv/bin/python", "-m", "uvicorn", "src.main:app", \
     "--host", "0.0.0.0", \
     "--port", "5000", \
     "--workers", "4"]
