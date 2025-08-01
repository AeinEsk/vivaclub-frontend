FROM --platform=linux/amd64 node:20-slim as build-stage
WORKDIR /app
COPY package.json ./
RUN rm -rf node_modules && yarn cache clean && yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM --platform=linux/amd64 nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY --from=build-stage /app/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]