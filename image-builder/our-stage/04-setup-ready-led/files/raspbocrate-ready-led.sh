#!/bin/bash
set -euo pipefail

COMPOSE_FILE="/opt/raspbocrate/docker-compose.yml"
LED_TRIGGER="/sys/class/leds/PWR/trigger"
LED_BRIGHTNESS="/sys/class/leds/PWR/brightness"
POLL_INTERVAL=5
POLL_TIMEOUT=600 # 10 minutes
FLASH_DURATION=120 # 2 minutes
FLASH_INTERVAL=0.5 # Toggle every 0.5s for a 1-second cycle

saved_trigger=""

restore_led() {
  if [ -n "$saved_trigger" ]; then
    echo "$saved_trigger" > "$LED_TRIGGER"
  fi
}

trap restore_led EXIT

# Wait for all containers to be healthy/running
elapsed=0
while [ "$elapsed" -lt "$POLL_TIMEOUT" ]; do
  all_ready=true

  output=$(docker compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null) || {
    all_ready=false
    sleep "$POLL_INTERVAL"
    elapsed=$((elapsed + POLL_INTERVAL))
    continue
  }

  # Check we have all expected services
  expected=$(docker compose -f "$COMPOSE_FILE" config --services 2>/dev/null | wc -l)
  actual=$(echo "$output" | grep -c '{' || true)
  if [ "$actual" -lt "$expected" ] || [ "$expected" -eq 0 ]; then
    all_ready=false
  fi

  # docker compose ps --format json outputs one JSON object per line
  # If Health field is non-empty, the service has a healthcheck and must be "healthy"
  # Otherwise, just check State is "running"
  while IFS= read -r line; do
    [ -z "$line" ] && continue

    state=$(echo "$line" | jq -r '.State')
    health=$(echo "$line" | jq -r '.Health')

    if [ -n "$health" ] && [ "$health" != "null" ]; then
      if [ "$health" != "healthy" ]; then
        all_ready=false
        break
      fi
    elif [ "$state" != "running" ]; then
      all_ready=false
      break
    fi
  done <<< "$output"

  if [ "$all_ready" = true ]; then
    break
  fi

  sleep "$POLL_INTERVAL"
  elapsed=$((elapsed + POLL_INTERVAL))
done

if [ "$all_ready" != true ]; then
  echo "Timed out waiting for containers to be ready"
  exit 1
fi

echo "All containers are ready, flashing power LED"

# Save current trigger - active trigger is shown in [brackets]
saved_trigger=$(sed -n 's/.*\[\(.*\)\].*/\1/p' "$LED_TRIGGER")

# Take control of the LED
echo none > "$LED_TRIGGER"

# Flash for FLASH_DURATION seconds
toggles=$(awk "BEGIN { printf \"%d\", $FLASH_DURATION / $FLASH_INTERVAL }")
for ((i = 0; i < toggles; i++)); do
  echo $(( i % 2 )) > "$LED_BRIGHTNESS"
  sleep "$FLASH_INTERVAL"
done

# Restore happens via the EXIT trap
