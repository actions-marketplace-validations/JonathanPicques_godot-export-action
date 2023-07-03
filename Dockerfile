FROM oven/bun

COPY src/ /src/
COPY bun.lockb /bun.lockb
COPY package.json /package.json

RUN apt-get update -y
RUN apt-get install -y zip
RUN apt-get install -y libfontconfig

RUN bun install
ENTRYPOINT ["bun", "/src/main.ts"]
