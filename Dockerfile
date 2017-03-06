FROM registry.cn-shenzhen.aliyuncs.com/zerolab/alp_nodejs
# RUN apk update && apk upgrade
# RUN apk add bash
# RUN apk add nodejs
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN cnpm install pm2 -g

ADD . /var/website
WORKDIR /var/website/app

RUN cnpm install --production

EXPOSE 14330

CMD ["pm2", "startOrGracefulReload", "process.json", "--no-daemon"]
