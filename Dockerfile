###################
# BUILD FOR PRODUCTION
###################

FROM node:16-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node . .

RUN npm ci && npm cache clean --force

RUN npm run build

USER node

###################
# PRODUCTION
###################

FROM node:16-alpine As production

COPY --chown=node:node --from=build /usr/src/app/package*.json ./
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/build ./build

ENV NODE_ENV production

CMD [ "node", "build/crawler.js" ]
