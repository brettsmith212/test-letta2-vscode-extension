docker run \
  -v ~/.letta/.persist/pgdata:/var/lib/postgresql/data \
  --env-file .env \
  -p 8283:8283 \
  letta/letta:latest