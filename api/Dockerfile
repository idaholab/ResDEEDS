FROM python:3.12

WORKDIR /var/www

COPY . /var/www

# Install dependencies
RUN pip install --upgrade pip \
    && pip install -r requirements-test.txt

COPY ./etc/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod a+x /usr/local/bin/entrypoint.sh

ENV PORT=5000
EXPOSE 5000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
