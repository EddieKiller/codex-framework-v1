FROM mcr.microsoft.com/playwright:v1.52.0-noble@sha256:a021500a801bab0611049217ffad6b9697d827205c15babb86a53bc1a61c02d5
WORKDIR /tests
COPY package.json package-lock.json ./
RUN npm ci
COPY tests/ ./tests/
CMD ["node", "node_modules/@playwright/test/cli.js", "test", "tests/todo.spec.js"]
