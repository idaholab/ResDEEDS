FROM node:24 AS build

WORKDIR /var/www

COPY . /var/www/

# Configure INL certs and environment variables
ADD http://certstore.inl.gov/pki/CAINLROOT_B64.crt /usr/local/share/ca-certificates/
RUN /usr/sbin/update-ca-certificates
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt \
    REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    CURL_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_DIR=/etc/ssl/certs/

# Configure PNPM home directory and add it to PATH for global package access
ENV PNPM_HOME=/root/.local/share/pnpm \
    PATH="/root/.local/share/pnpm:$PATH"

RUN apt-get update
RUN npm i -g pnpm@latest \
    && mkdir -p $PNPM_HOME \
    && pnpm add -g @angular/cli \
    && pnpm install

RUN pnpm ng build --configuration=production

FROM nginx:alpine

COPY --from=build /var/www/dist/resdeeds /usr/share/nginx/html

EXPOSE 80 443 4200

CMD ["nginx", "-g", "daemon off;"]
