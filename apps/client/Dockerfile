
# Builder
FROM node:20.0.0-alpine3.17 as builder
WORKDIR /app/builder

COPY . .
RUN npm install
RUN npx nx run-many --target=build --projects=client --parallel=3 --skip-nx-cache


# Production
FROM node:20.0.0-alpine3.17
WORKDIR /app/builder

COPY --from=builder /app/builder/dist/apps/client .
RUN npm install

EXPOSE 3000

ENTRYPOINT ["yarn", "start"]
