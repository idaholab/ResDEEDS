FROM node:20-alpine

WORKDIR /var/www

COPY . /var/www/

# Configure INL certs and environment variables
RUN apk update && apk add ca-certificates
ADD http://certstore.inl.gov/pki/CAINLROOT_B64.crt /usr/local/share/ca-certificates/
RUN /usr/sbin/update-ca-certificates
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt \
    REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    CURL_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_DIR=/etc/ssl/certs/

RUN npm install -g @angular/cli

RUN npm install

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0"]