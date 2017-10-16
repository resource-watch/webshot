FROM node:8.4
MAINTAINER raul.requero@vizzuality.com

ENV USER webshot-service

RUN apt-get update && apt-get install -y \
	apt-transport-https \
	ca-certificates \
	curl \
  gnupg \
  bash \
  build-essential \
  python \
	--no-install-recommends \
	&& curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
	&& echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
	&& apt-get update && apt-get install -y \
	google-chrome-stable \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

# Add Chrome as a user
RUN groupadd -r $USER && useradd -r -g $USER -G audio,video $USER \
    && mkdir -p /home/$USER && chown -R $USER:$USER /home/$USER


RUN npm install -g grunt-cli bunyan

RUN mkdir -p /home/$USER
COPY package.json /home/$USER/package.json
RUN cd /home/$USER && npm install

COPY entrypoint.sh /home/$USER/entrypoint.sh
COPY config /home/$USER/config

WORKDIR /home/$USER

COPY ./app /home/$USER/app
RUN chown $USER:$USER /home/$USER

# Tell Docker we are going to use this ports
EXPOSE 5000

ENTRYPOINT ["./entrypoint.sh"]
