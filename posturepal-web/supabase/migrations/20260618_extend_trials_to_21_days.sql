-- Extend all activated trials to a fresh 21-day window from now.
-- Strict extension: previous max remaining was 5 days, so no user loses time.
-- Untouched trials (token_consumed = false) get 21 days on activation
-- via the updated TRIAL_LENGTH_MS constant in validate-trial-key/route.js.
-- License-key (paid) users are unaffected — they don't read from this table.
update trials
set started_at = now(),
    expires_at = now() + interval '21 days'
where token_consumed = true;
