# host node ourselves b/c docker hub got tired of serving terabytes for public traffic
FROM 213288384225.dkr.ecr.us-west-1.amazonaws.com/node:16

WORKDIR /usr/src/frontend

COPY . .

RUN yarn install --fronzen-lockfile
RUN yarn build:web

EXPOSE 5000

CMD ["yarn", "serve:web"]
