import { supabase } from './supabaseClient';

/*
 * Syncs the local user to the global leaderboard.
 *
 * The leaderboard table is keyed on `username`, so a plain upsert after the
 * user renames themselves would not conflict with anything — it would insert a
 * brand-new row and leave the old one behind as a duplicate. To avoid that we
 * remember the username currently registered in the table (`leaderboardUsername`
 * in the local store) and, if it has changed, rename that existing row in place
 * before upserting.
 *
 * This is the single writer for the leaderboard table — background scoring,
 * license activation and the Leaderboard screen all call this, so renames stay
 * consistent no matter which one runs first.
 */
export async function syncLeaderboard() {
  if (!supabase || !window.api) return;
  try {
    const username = await window.api.getData('username');
    if (!username) return;

    const xp = (await window.api.getXP()) || { total: 0, level: 1 };
    const updated_at = new Date().toISOString();
    const row = { username, xp: xp.total || 0, level: xp.level || 1, updated_at };

    // If the user has renamed themselves, rename their existing row instead of
    // creating a duplicate under the new name.
    const registered = await window.api.getData('leaderboardUsername');
    if (registered && registered !== username) {
      await supabase.from('leaderboard').update(row).eq('username', registered);
    }

    await supabase.from('leaderboard').upsert(row, { onConflict: 'username' });

    // Remember the name now live in the table so the next rename can find it.
    await window.api.setData('leaderboardUsername', username);
  } catch (err) {
    console.error('Leaderboard sync failed:', err);
  }
}
