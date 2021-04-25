FROM node:14.15.0-alpine3.12 as builder
WORKDIR /opt/app

COPY package*.json ./
RUN npm install

COPY assets/ ./assets
COPY src/ ./src
COPY tsconfig.json webpack.config.js ./
RUN npm run build

####

FROM node:14.15.0-alpine3.12
WORKDIR /opt/app

RUN apk add curl ffmpeg

COPY package*.json ./
RUN npm install --only=prod

COPY --from=builder /opt/app/public/*.* ./public/
COPY src/ ./src

ENV BACKEND_PORT=80
CMD npm run server
