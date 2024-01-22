
# Builder
FROM node:20.0.0-alpine3.17 as builder
WORKDIR /app/builder

COPY /package.json yarn.lock ./
RUN --mount=type=cache,id=yarn,target=/yarn/store yarn install --frozen-lockfile --ignore-scripts
RUN yarn install

COPY . .
ARG DOPPLER_TOKEN
ENV DOPPLER_TOKEN "$DOPPLER_TOKEN"

RUN yarn nx run-many --target=build --projects=server --parallel=3 --skip-nx-cache
# RUN yarn nx run-many --target=generate --projects=server --parallel=3



# Production
FROM node:20.0.0-alpine3.17

RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub
RUN echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories
RUN apk add doppler
RUN corepack enable

COPY --from=builder /app/builder/dist/apps/server .
COPY apps/server/script/start-server.sh ./start-server.sh
# COPY apps/server/prisma ./prisma

RUN yarn install --production
# RUN npx prisma generate --schema=prisma/schema.prisma

EXPOSE 8080
ENTRYPOINT [ "doppler", "run", "--", "/bin/sh", "start-server.sh" ]