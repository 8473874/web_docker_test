FROM alpine
RUN apk update && apk upgrade
RUN apk add bash
RUN apk add nodejs
RUN npm install pm2 -g

ADD . /var/webapp
WORKDIR /var/webapp

RUN npm install

EXPOSE 14330

CMD ["pm2", "startOrGracefulReload", "process.json", "--no-daemon"]
