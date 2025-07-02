FROM node:20 AS build

WORKDIR /source

COPY libs/shared ./libs/shared
COPY apps/auth-callback ./apps/auth-callback

COPY tsconfig.json ./

COPY package.json ./
COPY package-lock.json ./

RUN npm install
RUN npm run build

FROM node:20 AS modules

WORKDIR /source

COPY --from=build /source/libs/shared/dist ./libs/shared/dist
COPY --from=build /source/apps/auth-callback/dist ./apps/auth-callback/dist

COPY --from=build /source/libs/shared/package.json ./libs/shared/package.json
COPY --from=build /source/apps/auth-callback/package.json ./apps/auth-callback/package.json

COPY package.json ./
COPY package-lock.json ./

RUN npm install --omit=dev
RUN mkdir /resolved_modules && cp -rL node_modules/. /resolved_modules/

FROM public.ecr.aws/lambda/nodejs:20

WORKDIR /var/task

COPY --from=modules /resolved_modules ./node_modules
COPY --from=build /source/apps/auth-callback/dist ./

CMD ["index.handler"]
