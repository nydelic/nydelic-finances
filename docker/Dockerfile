FROM directus/directus:9.12.2

LABEL maintainer="Josias Ribi contact@josias.me"

COPY --chown=node ./extensions /directus/extensions

WORKDIR "/directus/extensions/endpoints"

RUN npm ci
RUN npm run build

WORKDIR "/directus"

ENV EXTENSIONS_PATH="./extensions/dist"
