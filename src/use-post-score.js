import { useEffect, useState } from 'react';
import { supaClient } from './supa-client';

export default function usePostScore(postId, initialScore) {
  const [score, setScore] = useState(initialScore);
  const [sub, setSub] = useState(undefined);
  useEffect(() => {
    if (score === undefined && initialScore !== undefined) {
      setScore(initialScore);
    }
    if (!sub && postId) {
      setSub(
        supaClient
          .channel(`post_${postId}_score`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'post_score',
              filter: `post_id=eq.${postId}`,
            },
            (payload) => {
              setScore(payload.new.score);
            }
          )
          .subscribe()
      );
    }
    return () => {
      sub?.unsubscribe();
    };
  }, [postId]);

  return score;
}
