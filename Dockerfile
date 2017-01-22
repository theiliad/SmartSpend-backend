FROM node:latest

MAINTAINER Eliad Moosavi

ENV NODE_ENV=production
ENV PORT=3000

COPY	. /var/www
WORKDIR /var/www

RUN npm install

EXPOSE $PORT

ENTRYPOINT ["npm"]

CMD ["start"]