FROM node:14.17.0
WORKDIR /app
COPY package.json .
RUN npm install
COPY . ./
EXPOSE 3000
CMD ["npm","run","game",">","/dev/null","2>&1"]
