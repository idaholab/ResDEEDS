FROM python:3.12

WORKDIR /var/www

COPY . /var/www

# Configure INL certs and environment variables
ADD http://certstore.inl.gov/pki/CAINLROOT_B64.crt /usr/local/share/ca-certificates/
RUN /usr/sbin/update-ca-certificates
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt \
    REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    CURL_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_DIR=/etc/ssl/certs/

# Install dependencies
RUN apt-get update \
    && apt-get install -y build-essential cargo
RUN pip install --trusted-host pypi.org  --trusted-host files.pythonhosted.org--upgrade pip \
    && pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements-test.txt

COPY ./etc/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod a+x /usr/local/bin/entrypoint.sh

ENV PORT=5000
EXPOSE 5000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
