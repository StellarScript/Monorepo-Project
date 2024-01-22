# Builder
FROM node:20.9.0 as builder
WORKDIR /app/builder

COPY . .
RUN yarn install
RUN yarn nx run-many --target=build --projects=client --parallel=3 --skip-nx-cache


# Production
FROM node:20.9.0
WORKDIR /app

COPY --from=builder /app/builder/dist/client .
RUN yarn install --production

EXPOSE 3000
ENTRYPOINT ["yarn", "start"]
