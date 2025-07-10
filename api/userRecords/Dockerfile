FROM node:20 AS builder

WORKDIR /source

COPY libs/shared ./libs/shared
COPY api/userRecords ./api/userRecords

COPY tsconfig.json ./

COPY package.json ./
COPY package-lock.json ./


RUN npm install
RUN npm run build

FROM node:20 AS packager

WORKDIR /source

COPY --from=builder /source/libs/shared/dist ./libs/shared/dist
COPY --from=builder /source/libs/shared/package.json ./libs/shared/package.json

COPY --from=builder /source/api/userRecords/dist ./api/userRecords/dist
COPY --from=builder /source/api/userRecords/package.json ./api/userRecords/package.json

COPY package.json ./
COPY package-lock.json ./

RUN npm install --omit=dev
RUN mkdir /resolved_modules && cp -rL node_modules/. /resolved_modules/

FROM public.ecr.aws/lambda/nodejs:20
WORKDIR /var/task

COPY --from=packager /resolved_modules ./node_modules
COPY --from=packager /source/api/userRecords/dist ./

CMD ["index.handler"]
