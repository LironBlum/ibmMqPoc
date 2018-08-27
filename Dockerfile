FROM node
LABEL maintainer "LironBlum"
# put the app in the right folder
RUN mkdir -p /var/app
WORKDIR /var/app
COPY ./package.json /var/app
RUN npm install --production
# be sure you have a .dockerignore file for COPY
COPY . /var/app
#RUN npm run lint
EXPOSE 9300

# reduce permissions for account running app
USER node

CMD [ "npm", "start" ]
