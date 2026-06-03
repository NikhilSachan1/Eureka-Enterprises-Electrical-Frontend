# syntax=docker/dockerfile:1

FROM node:22.12-alpine AS builder

ARG BUILD_TARGET=prod

WORKDIR /app

COPY package.json package-lock.json ./

ENV HUSKY=0 \
    NODE_ENV=development \
    BUILD_TARGET=${BUILD_TARGET}

RUN npm ci --ignore-scripts

COPY . .

RUN echo ">>> BUILD_TARGET=${BUILD_TARGET}" \
    && npm run "build:${BUILD_TARGET}" \
    && if [ "${BUILD_TARGET}" = "uat" ]; then \
         grep -rq "api-uat.eurekaenterprises.org" /app/dist \
           || (echo "ERROR: UAT build does not contain api-uat URL" && exit 1); \
       elif [ "${BUILD_TARGET}" = "prod" ]; then \
         grep -rq "api.eurekaenterprises.org/api/v1" /app/dist \
           || (echo "ERROR: PROD build does not contain prod API URL" && exit 1); \
       fi

FROM nginx:1.27-alpine AS production

WORKDIR /usr/share/nginx/html

RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/* \
    && chown -R nginx:nginx \
        /var/cache/nginx \
        /var/log/nginx \
        /etc/nginx/conf.d \
        /usr/share/nginx/html

COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder --chown=nginx:nginx \
    /app/dist/eureka-enterprises-electrical-frontend/browser \
    ./

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://127.0.0.1:80/health || exit 1

ENTRYPOINT ["dumb-init", "--"]

CMD ["nginx", "-g", "daemon off;"]
