# PayLens frontend

The frontend is an independent Next.js server deployment. It listens on port `3000` and has a Docker liveness route at `/home`.

## Production image

`NEXT_PUBLIC_API_BASE_URL` is a browser-visible, build-time value. It must point to an API URL the user's browser can reach and must never contain a secret. Changing it requires rebuilding the frontend image.

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.paylens.example/api/v1 \
  -t paylens-app .

docker run --rm -p 3000:3000 paylens-app
```

The final image uses Next standalone output, runs as the unprivileged `node` user, and contains only the standalone server, static assets, and public assets.
