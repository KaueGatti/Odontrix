FROM ubuntu:latest
LABEL authors="kaueg"

ENTRYPOINT ["top", "-b"]

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev"]