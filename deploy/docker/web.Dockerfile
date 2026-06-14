FROM node:24-bookworm-slim AS base

ENV CI=true
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/gateway/package.json apps/gateway/package.json
COPY packages/schema/package.json packages/schema/package.json
COPY packages/sdk/package.json packages/sdk/package.json
COPY packages/cli/package.json packages/cli/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS builder

ARG NEXT_PUBLIC_APP_URL=https://useskillhub.com
ARG NEXT_PUBLIC_API_URL=https://api.useskillhub.com
ARG SKILLHUB_SERVER_API_URL=https://api.useskillhub.com

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV SKILLHUB_SERVER_API_URL=$SKILLHUB_SERVER_API_URL

COPY . .
RUN pnpm --filter @useskillhub/web... build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app /app

EXPOSE 3000

CMD ["pnpm", "--filter", "@useskillhub/web", "start"]
