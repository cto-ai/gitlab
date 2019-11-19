############################
# Build container
############################
FROM node:10-alpine AS dep

WORKDIR /ops

RUN apk add python

COPY package.json .

RUN npm install

COPY . .

RUN mkdir lib \ 
  && npm run build

############################
# Final container
############################
FROM node:10-alpine

WORKDIR /ops

RUN apk --update --no-cache add git make vim gnupg && npm install -g typescript && npm install -g ts-node @types/node

COPY --from=dep /ops .
