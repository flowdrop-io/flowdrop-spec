# ============================================================
# The FlowDrop Workflow Specification — static site image
# ============================================================
# One page per rule, generated from rules/*.yml at build time and served by nginx.
#
# The build context is the REPOSITORY ROOT, not site/: the site reads ../rules,
# ../narrative and ../conventions.md while it builds, so a context of site/ alone
# would produce a site with no rules in it.
#
#   docker build -t flowdrop-spec .
#   docker run -p 8080:80 flowdrop-spec

# --- Stage 1: build ---
FROM node:22-alpine AS builder

WORKDIR /app

# Dependencies first, so a change to a rule does not reinstall node_modules.
COPY site/package.json site/package-lock.json ./site/
RUN cd site && npm ci

# The corpus the site is generated from.
COPY rules ./rules
COPY narrative ./narrative
COPY conventions.md ./conventions.md

# The site itself.
COPY site ./site

ENV NODE_ENV=production
RUN cd site && npm run build

# --- Stage 2: serve ---
FROM nginx:alpine AS server

COPY --from=builder /app/site/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-headers.conf /etc/nginx/conf.d/nginx-headers.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
