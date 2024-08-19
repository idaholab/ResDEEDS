# Copyright 2023, Battelle Energy Alliance, LLC
FROM --platform=linux/amd64 python:3.10

WORKDIR /app

COPY . /app

# Configure INL certs and environment variables
ADD http://certstore.inl.gov/pki/CAINLROOT_B64.crt /usr/local/share/ca-certificates/
RUN /usr/sbin/update-ca-certificates
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt \
    REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    CURL_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_DIR=/etc/ssl/certs/

# Install server dependencies
RUN apt-get update &&  apt-get install -y \
    build-essential \
    gcc \
    libdbus-1-3 \
    libegl-dev \
    libgl1-mesa-dev \
    libgl-dev \
    libglib2.0-dev \
    libpq-dev \
    libxkbcommon-x11-0 \
    python3-dev

# # Install Python dependencies
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-deps \
    spinetoolbox==0.7.4 \
    spine_engine==0.23.4 \
    spine_items==0.21.5 \
    spinedb_api==0.30.5
RUN pip install -r requirements.txt

# # Install Julia, SpineInterface and SpineOpt
RUN python -m jill install --confirm
RUN julia -e 'using Pkg; Pkg.rm("SpineInterface")' || true \
    julia -e 'using Pkg; Pkg.rm("SpineOpt")' || true \
    julia -e 'using Pkg; Pkg.add(url="https://github.com/spine-tools/SpineInterface.jl.git")' \
    julia -e 'using Pkg; Pkg.add(url="https://github.com/spine-tools/SpineOpt.jl.git")' \
    julia -e 'using Pkg; Pkg.add(["XLSX", "DataFrames", "Distributions", "CSV", "Revise", "Cbc", "Clp"])'

RUN mkdir -p /root/.spinetoolbox/SpineProject
COPY /install/ /root/.spinetoolbox/SpineProject/

# Set Flask and QT environment variables
ENV QT_QPA_PLATFORM="offscreen" \
    FLASK_APP="src/app.py"

# Expose the Flask port
EXPOSE 5000

ENTRYPOINT ["flask", "run", "--host=0.0.0.0", "--port=5000"]
