//cast-vote.js

import { supaClient } from './supa-client';

//cast vote
export async function castVote({
  postId,
  userId,
  voteType,
  onSuccess = () => {},
}) {
  await supaClient.from('post_votes').upsert(
    {
      post_id: postId,
      user_id: userId,
      vote_type: voteType,
    },
    { onConflict: 'post_id,user_id' }
  );
  onSuccess();
}
