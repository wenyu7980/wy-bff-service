FROM node:10.24.0

ENV NACOS_ADDRESS host.docker.internal
ENV NACOS_NAMESPACE public
ENV NACOS_GROUP_NAME DEFAULT_GROUP
ENV ADDRESS host.docker.internal
ENV PORT 8100

RUN mkdir -p /usr/src/node-app/server
WORKDIR /usr/src/node-app/server

COPY package.json package.json
RUN npm i --production

COPY . .

EXPOSE 8100

CMD npm run start
