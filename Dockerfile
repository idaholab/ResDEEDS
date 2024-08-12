FROM python:3.9.13

WORKDIR /app

COPY . /app

# Configure INL certs and environment variables
RUN wget -q -P /usr/local/share/ca-certificates/ http://certstore.inl.gov/pki/CAINLROOT_B64.crt
RUN /usr/sbin/update-ca-certificates
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt
ENV REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt
ENV CURL_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt
ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
ENV SSL_CERT_DIR=/etc/ssl/certs/

# Install server dependencies
RUN apt update &&  apt install -y \
    build-essential \
    gcc \
    libpq-dev \
    postgresql-server-dev-all \
    python3-dev

# Install python dependencies
RUN pip install --upgrade pip setuptools wheel
# RUN pip install spinetoolbox==0.7.4 --verbose
RUN pip install PySide6==6.5.2 spinetoolbox==0.7.4

ENTRYPOINT [ "python", "src/app.py" ]