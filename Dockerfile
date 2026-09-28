FROM nginx:1.27.2-alpine@sha256:74175cf34632e88c6cfe206897cbfe2d2fecf9bf033c40e7f9775a3689e8adc7
COPY src/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
