FROM python:3.12

WORKDIR /app

COPY . /app

RUN apt update &&  apt install -y \
    build-essential \
    gcc \
    libpq-dev \
    python3-dev

RUN pip install --upgrade pip setuptools wheel
RUN pip install GDX2py
RUN pip install spinedb_api --verbose

ENTRYPOINT [ "python", "src/app.py" ]