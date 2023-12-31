//Post.jsx
import {
  BrowserRouter,
  Route,
  Link,
  useParams,
  useNavigate,
} from 'react-router-dom';
import { UserContext } from './App';
import { castVote } from './cast-vote';
import { supaClient } from './supa-client';
import { timeAgo } from './time-ago';
import UpVote from './UpVote';
import usePostScore from './use-post-score';
import React, { useContext, useEffect, useState, useMemo } from 'react';

export async function getPostDetails({ params: { postId }, userContext }) {
  try {
    console.log('Post ID:', postId);
    const response = await supaClient
      .rpc('get_single_post_with_comments', { post_id: postId })
      .select('*');
    const data = response.data;
    const error = response.error;

    if (error) {
      console.error('Error fetching post:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.error('No data found or data is empty');
      return null;
    }
    const postMap = data.reduce((acc, post) => {
      acc[post.id] = post;
      return acc;
    }, {});

    const post = postMap[postId];
    const comments = data.filter((x) => x.id !== postId);
    if (!userContext.session?.user) {
      return { post, comments };
    }
    const { data: votesData } = await supaClient
      .from('post_votes')
      .select('*')
      .eq('user_id', userContext.session?.user.id);
    if (!votesData) {
      return;
    }
    const votes = votesData.reduce((acc, vote) => {
      acc[vote.post_id] = vote.vote_type;
      return acc;
    }, {});
    return { post, comments, myVotes: votes };
  } catch (e) {
    console.error('Error fetching post:', e);
    throw new Error('Post not found');
  }
}

export function PostView() {
  const userContext = useContext(UserContext);
  const params = useParams();
  const [postDetailData, setPostDetailData] = useState({
    post: null,
    comments: [],
  });
  const [bumper, setBumper] = useState(0);
  useEffect(() => {
    getPostDetails({ params, userContext }).then((newPostDetailData) => {
      if (newPostDetailData) {
        setPostDetailData(newPostDetailData);
      }
    });
  }, [userContext, params, bumper]);
  const nestedComments = useMemo(
    () => unsortedCommentsToNested(postDetailData.comments),
    [postDetailData]
  );

  return (
    <PostPresentation
      postDetailData={postDetailData}
      userContext={userContext}
      setBumper={setBumper}
      bumper={bumper}
      nestedComments={nestedComments}
    />
  );
}

function PostPresentation({
  postDetailData,
  userContext,
  setBumper,
  bumper,
  nestedComments,
}) {
  const score = usePostScore(
    postDetailData.post?.id || '',
    postDetailData.post?.score
  );
  return (
    <div className="post-detail-outer-container">
      <div className="post-detail-inner-container">
        <div className="post-detail-upvote-container">
          <UpVote
            direction="up"
            filled={
              postDetailData.myVotes &&
              postDetailData.post &&
              postDetailData.myVotes[postDetailData.post.id] === 'up'
            }
            enabled={!!userContext.session}
            onClick={async () => {
              if (!postDetailData.post) {
                return;
              }
              await castVote({
                postId: postDetailData.post.id,
                userId: userContext.session?.user.id,
                voteType: 'up',
                onSuccess: () => {
                  setBumper(bumper + 1);
                },
              });
            }}
          />
          <p className="text-center" data-e2e="upvote-count">
            {score}
          </p>
          <UpVote
            direction="down"
            filled={
              postDetailData.myVotes &&
              postDetailData.post &&
              postDetailData.myVotes[postDetailData.post.id] === 'down'
            }
            enabled={!!userContext.session}
            onClick={async () => {
              if (!postDetailData.post) {
                return;
              }
              await castVote({
                postId: postDetailData.post.id,
                userId: userContext.session?.user.id,
                voteType: 'down',
                onSuccess: () => {
                  setBumper(bumper + 1);
                },
              });
            }}
          />
        </div>

        <div className="post-detail-body">
          <p>
            Posted By {postDetailData.post?.author_name}{' '}
            {postDetailData.post &&
              `${timeAgo(postDetailData.post?.created_at)} ago`}
          </p>
          <h3 className="text-2xl">{postDetailData.post?.title}</h3>
          <p className="post-detail-content" data-e2e="post-content">
            {postDetailData.post?.content}
          </p>
          {userContext.session && postDetailData.post && (
            <CreateComment
              parent={postDetailData.post}
              onSuccess={() => {
                setBumper(bumper + 1);
              }}
            />
          )}
          {nestedComments.map((comment) => (
            <CommentView
              key={comment.id}
              comment={comment}
              myVotes={postDetailData.myVotes}
              onVoteSuccess={() => {
                setBumper(bumper + 1);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CommentView({ comment, myVotes, onVoteSuccess }) {
  const score = usePostScore(comment.id, comment.score);
  const [commenting, setCommenting] = useState(false);
  const { session } = useContext(UserContext);
  return (
    <>
      <div
        className="post-detail-comment-container"
        data-e2e={`comment-${comment.id}`}
      >
        <div className="post-detail-comment-inner-container">
          <div className="post-detail-comment-upvote-container">
            <UpVote
              direction="up"
              filled={myVotes?.[comment.id] === 'up'}
              enabled={!!session}
              onClick={async () => {
                await castVote({
                  postId: comment.id,
                  userId: session?.user.id,
                  voteType: 'up',
                  onSuccess: () => {
                    onVoteSuccess();
                  },
                });
              }}
            />
            <p className="text-center" data-e2e="upvote-count">
              {score}
            </p>
            <UpVote
              direction="down"
              filled={myVotes?.[comment.id] === 'down'}
              enabled={!!session}
              onClick={async () => {
                await castVote({
                  postId: comment.id,
                  userId: session?.user.id,
                  voteType: 'down',
                  onSuccess: () => {
                    onVoteSuccess();
                  },
                });
              }}
            />
          </div>
          <div className="post-detail-comment-body">
            <p>
              {comment.author_name} - {timeAgo(comment.created_at)} ago
            </p>
            <p
              className="post-detail-comment-content"
              data-e2e="comment-content"
            >
              {comment.content}
            </p>
            {commenting && (
              <CreateComment
                parent={comment}
                onCancel={() => setCommenting(false)}
                onSuccess={() => {
                  onVoteSuccess();
                  setCommenting(false);
                }}
              />
            )}
            {!commenting && (
              <div className="ml-4">
                <button
                  onClick={() => setCommenting(!commenting)}
                  disabled={!session}
                >
                  {commenting ? 'Cancel' : 'Reply'}
                </button>
              </div>
            )}
            {comment.comments.map((childComment) => (
              <CommentView
                key={childComment.id}
                comment={childComment}
                myVotes={myVotes}
                onVoteSuccess={() => onVoteSuccess()}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function CreateComment({ parent, onCancel, onSuccess }) {
  const user = useContext(UserContext);
  const [comment, setComment] = useState('');
  const textareaRef = useRef(null);
  return (
    <>
      <form
        className="post-detail-create-comment-form"
        data-e2e="create-comment-form"
        onSubmit={(event) => {
          event.preventDefault();
          supaClient
            .rpc('create_new_comment', {
              user_id: user.session?.user.id || '',
              content: comment,
              path: `${parent.path}.${parent.id.replaceAll('-', '_')}`,
            })
            .then(({ error }) => {
              if (error) {
                console.log(error);
              } else {
                onSuccess();
                textareaRef.current?.value != null &&
                  (textareaRef.current.value = '');
              }
            });
        }}
      >
        <h3>Add a New Comment</h3>
        <textarea
          ref={textareaRef}
          name="comment"
          placeholder="Your comment here"
          className="post-detail-create-comment-form-content"
          onChange={({ target: { value } }) => {
            setComment(value);
          }}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="post-detail-create-comment-form-submit-button"
            disabled={!comment}
          >
            Submit
          </button>
          {onCancel && (
            <button
              type="button"
              className="post-detail-create-comment-form-cancel-button"
              onClick={() => onCancel()}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </>
  );
}

function unsortedCommentsToNested(comments) {
  const commentMap = comments.reduce((acc, comment) => {
    acc[comment.id] = {
      ...comment,
      comments: [],
    };
    return acc;
  }, {});
  const result = [];
  const sortedByDepthThenCreationTime = [...Object.values(commentMap)].sort(
    (a, b) => {
      const aDepth = getDepth(a.path);
      const bDepth = getDepth(b.path);
      return aDepth > bDepth
        ? 1
        : aDepth < bDepth
        ? -1
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
  );
  for (const post of sortedByDepthThenCreationTime) {
    if (getDepth(post.path) === 1) {
      result.push(post);
    } else {
      const parentNode = getParent(commentMap, post.path);
      parentNode.comments.push(post);
    }
  }
  return result;
}

function getParent(map, path) {
  const parentId = path.replace('root.', '').split('.').slice(-1)[0];
  const parent = map[convertToUuid(parentId)];
  if (!parent) {
    throw new Error(`Parent not found at ${parentId}`);
  }
  return parent;
}

function convertToUuid(path) {
  return path.replaceAll('_', '-');
}

function getDepth(path) {
  const rootless = path.replace('.', '');
  return rootless.split('.').filter((x) => !!x).length;
}
