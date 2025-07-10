FROM node:20 AS builder

WORKDIR /source

COPY libs/shared ./libs/shared
COPY auth/authorizer ./auth/authorizer

COPY tsconfig.json ./

COPY package.json ./
COPY package-lock.json ./

RUN npm install
RUN npm run build

FROM node:20 AS packager

WORKDIR /source

COPY --from=builder /source/libs/shared/dist ./libs/shared/dist
COPY --from=builder /source/libs/shared/package.json ./libs/shared/package.json

COPY --from=builder /source/auth/authorizer/dist ./auth/authorizer/dist
COPY --from=builder /source/auth/authorizer/package.json ./auth/authorizer/package.json

COPY package.json ./
COPY package-lock.json ./

RUN npm install --omit=dev
RUN mkdir /resolved_modules && cp -rL node_modules/. /resolved_modules/

FROM public.ecr.aws/lambda/nodejs:20

WORKDIR /var/task

COPY --from=packager /resolved_modules ./node_modules
COPY --from=packager /source/auth/authorizer/dist ./

CMD ["index.handler"]
