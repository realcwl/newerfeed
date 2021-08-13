# host node ourselves b/c docker hub got tired of serving terabytes for public traffic
FROM node:16.5.0

WORKDIR /usr/src/frontend

COPY package.json ./
COPY yarn.lock ./
COPY . .

RUN echo 'wtf'
RUN yarn install --fronzen-lockfile
RUN yarn build:web

EXPOSE 5000

CMD ["yarn", "serve:web"]
