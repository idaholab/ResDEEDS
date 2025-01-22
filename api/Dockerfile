FROM python:3.12

WORKDIR /var/www

COPY . /var/www

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
