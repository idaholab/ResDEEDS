# will be used primarily for testing
FROM ubuntu:22.04
WORKDIR /resilience_calculator
COPY install install
RUN chmod +x ./install/install.sh
RUN chmod +x ./install/run.sh
COPY requirements.txt requirements.txt
RUN ./install/install.sh
COPY config config
COPY spine spine
COPY src src
COPY resilience_calculator.db resilience_calculator.db
RUN mkdir -p /root/.spinetoolbox/SpineProject
COPY ["./install/Spine Toolbox.conf", "/root/.config/SpineProject/"]
ENTRYPOINT ["./install/run.sh"]