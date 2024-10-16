FROM node:20-alpine

WORKDIR /var/www

COPY . /var/www/

RUN npm install -g @angular/cli

RUN npm install

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0"]