FROM node:latest

WORKDIR /app

COPY ./package*.json ./

RUN npm clean-install --only=production

COPY ./index.js ./
COPY ./db*.js ./
COPY ./src ./src
COPY ./scripts/run-app ./scripts/run-app

RUN chmod 0755 ./scripts/run-app

EXPOSE 8080

ENV REST_API_ADDRESS "0.0.0.0"
ENV REST_API_DB_TYPE "mongo"
ENV REST_API_DB_HOST "database"
ENV NODE_ENV "production"

ENTRYPOINT [ "./scripts/run-app", "node", "." ]
