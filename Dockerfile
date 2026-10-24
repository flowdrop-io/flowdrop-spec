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
#
# The site is served at /spec, not at the root: it is published as a subfolder of
# https://flowdrop.io, so http://localhost:8080/spec/ is the front page.

# --- Stage 1: build ---
FROM node:22-alpine AS builder

WORKDIR /app

# Dependencies first, so a change to a rule does not reinstall node_modules.
COPY site/package.json site/package-lock.json ./site/
RUN cd site && npm ci

# The corpus the site is generated from.
COPY rules ./rules
COPY narrative ./narrative
COPY rulings ./rulings
COPY fixtures ./fixtures
COPY conventions.md ./conventions.md

# The site itself.
COPY site ./site

ENV NODE_ENV=production
RUN cd site && npm run build

# Pre-compress, so nginx's `brotli_static` / `gzip_static` sendfile a `.br` or
# `.gz` sibling instead of compressing on every request — the ~2MB search index
# most of all. Maximum levels, because this is paid once at build time. `-k`
# keeps the original for clients that accept neither encoding. An allow-list of
# text formats: already-compressed bytes only grow. `api/search` is named on its
# own because it is prerendered JSON with no extension. Same list as the docs
# image.
RUN apk add --no-cache brotli && \
    cd site/out && \
    find . -type f -size +1k \
        \( -name '*.html' -o -name '*.js' -o -name '*.mjs' -o -name '*.css' \
        -o -name '*.json' -o -name '*.svg' -o -name '*.txt' -o -name '*.xml' \
        -o -name '*.md' -o -name '*.map' -o -path './api/search' \) \
        -exec gzip -9 -k {} + \
        -exec brotli -q 11 -k {} + && \
    echo "pre-compressed $(find . -name '*.gz' | wc -l) .gz, $(find . -name '*.br' | wc -l) .br"

# --- Stage 2: serve ---
#
# Alpine's own nginx, not `nginx:alpine`: nginx.org's image has no brotli module,
# and Alpine's `nginx-mod-http-brotli` only loads into Alpine's nginx package.
# Alpine's layout differs from nginx.org's: server blocks go in http.d/ (its
# nginx.conf includes conf.d/ at the top level, outside `http`, where the
# add_header lines of nginx-headers.conf would be a fatal error), and the logs
# are files until they are pointed at the container's stdout/stderr.
FROM alpine:3.22 AS server

RUN apk add --no-cache nginx nginx-mod-http-brotli && \
    ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

# Under `/spec`, not at the root. Next bakes basePath into the emitted markup and
# asset URLs but still writes the export to `out/` with no `spec/` directory in it,
# so the base path is created here — in the filesystem, where nginx's `try_files
# $uri` keeps working — rather than by rewriting the request.
COPY --from=builder /app/site/out /usr/share/nginx/html/spec
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY nginx-headers.conf /etc/nginx/snippets/nginx-headers.conf

EXPOSE 80

STOPSIGNAL SIGQUIT

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/spec/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
