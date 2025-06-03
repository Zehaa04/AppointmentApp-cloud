FROM amazonlinux:2023

RUN dnf -y update && \
    dnf -y install nodejs && \
    dnf -y install postgresql15

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=8999

EXPOSE 8999

CMD ["npm", "start"]