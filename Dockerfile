FROM node:16.14.0-alpine3.14 AS Base

# Install the awscli tool, needed to access Parameter Store
RUN apk add --no-cache \
        g++ \
        make \
        python3 \
        py-pip \
# Create app directory

RUN pip3 install awscli

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./package*.json ./

# If you are building your code for production
# RUN npm install --only=production
RUN npm install

# Bundle app source
COPY . .

RUN npm run compile

### Final layer
FROM node:16.14.0-alpine3.14 AS Final

RUN apk add --no-cache \
        bash \
        g++ \
        make \
        python3 \
        py3-pip \
        && pip3 install --upgrade pip \
        && pip3 install --no-cache-dir \
            awscli \
        && rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN npm install --production --no-package-lock 

COPY --from=Base /usr/src/app/dist ./dist
COPY *.sh .

ARG COMMIT_ID
ENV COMMIT_ID=${COMMIT_ID:-non-codeship-version}
ENV NODE_ENV=production

EXPOSE 3005

RUN [ "chmod", "+x", "./run-with-aws-creds.sh" ]

CMD [ "./run-with-aws-creds.sh", "prod" ]
