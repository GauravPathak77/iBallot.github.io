FROM node:19

COPY . /app/

WORKDIR /app

RUN npm install

RUN apt-get update && apt-get install -y sqlite3

CMD ["node","app.js"]