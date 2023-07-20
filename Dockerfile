FROM node:20.4-bullseye
MAINTAINER info@vizzuality.com

ENV USER webshot-service

RUN curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

RUN apt-get update && apt-get install -y google-chrome-stable libxtst6 libxss1 --no-install-recommends

# Add Chrome as a user
RUN groupadd -r $USER && useradd -r -g $USER -G audio,video $USER \
    && mkdir -p /home/$USER && chown -R $USER:$USER /home/$USER


RUN yarn global add grunt-cli bunyan

RUN mkdir -p /home/$USER
COPY package.json /home/$USER/package.json
COPY yarn.lock /home/$USER/yarn.lock
RUN cd /home/$USER && yarn install

COPY entrypoint.sh /home/$USER/entrypoint.sh
COPY config /home/$USER/config

WORKDIR /home/$USER

COPY ./app /home/$USER/app
RUN chown $USER:$USER /home/$USER

# Tell Docker we are going to use this ports
EXPOSE 5000

ENTRYPOINT ["./entrypoint.sh"]
