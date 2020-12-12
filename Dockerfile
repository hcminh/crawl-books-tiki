FROM node:erbium-slim

WORKDIR /app

COPY ["package.json", "package-lock.json*", "yarn.lock*","./"]

RUN yarn install

COPY . .

CMD ["yarn","run", "start"]