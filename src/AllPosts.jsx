import React, { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { UserContext } from './App';
import { castVote } from './cast-vote';
import CreatePost from './CreatePost';
import { supaClient } from './supa-client';
import { timeAgo } from './time-ago';
import UpVote from './UpVote';
import usePostScore from './use-post-score';

export default function AllPosts() {
  const { session } = useContext(UserContext);
  const { pageNumber } = useParams();
  const [bumper, setBumper] = useState(0);
  const [posts, setPosts] = useState([]);
  const [myVotes, setMyVotes] = useState({});

  useEffect(() => {
    const queryPageNumber = pageNumber ? +pageNumber : 1;
    supaClient
      .rpc('get_posts', { page_number: queryPageNumber })
      .select('*')
      .then(({ data }) => {
        setPosts(data);
        if (session?.user) {
          supaClient
            .from('post_votes')
            .select('*')
            .eq('user_id', session.user.id)
            .then(({ data: votesData }) => {
              if (!votesData) {
                return;
              }
              const votes = votesData.reduce((acc, vote) => {
                acc[vote.post_id] = vote.vote_type;
                return acc;
              }, {});
              setMyVotes(votes);
            });
        }
      });
  }, [session, bumper, pageNumber]);

  return (
    <>
      {session && (
        <CreatePost
          newPostCreated={() => {
            setBumper(bumper + 1);
          }}
        />
      )}
      <div className="posts-container">
        {posts?.map((post) => (
          <Post
            key={post.id}
            postData={post}
            myVote={myVotes?.[post.id] || undefined}
            onVoteSuccess={() => {
              setBumper(bumper + 1);
            }}
          />
        ))}
      </div>
    </>
  );
}

function Post({ postData, myVote, onVoteSuccess }) {
  const score = usePostScore(postData.id, postData.score);
  const { session } = useContext(UserContext);

  return (
    <div className="post-container">
      <div className="post-upvote-container">
        <UpVote
          direction="up"
          filled={myVote === 'up'}
          enabled={!!session}
          onClick={async () => {
            await castVote({
              postId: postData.id,
              userId: session?.user.id,
              voteType: 'up',
              onSuccess: onVoteSuccess,
            });
          }}
        />
        <p className="text-center" data-e2e="upvote-count">
          {score}
        </p>
        <UpVote
          direction="down"
          filled={myVote === 'down'}
          enabled={!!session}
          onClick={async () => {
            await castVote({
              postId: postData.id,
              userId: session?.user.id,
              voteType: 'down',
              onSuccess: onVoteSuccess,
            });
          }}
        />
      </div>
      <Link to={`/post/${postData.id}`} className="flex-auto">
        <p className="mt-4">
          Posted by {postData.username} {timeAgo(postData.created_at)} ago
        </p>
        <h3 className="text-2xl">{postData.title}</h3>
      </Link>
    </div>
  );
}