// //AllPosts.jsx
// import React, {
//   useContext,
//   useEffect,
//   useState,
//   useMemo,
//   useCallback,
// } from 'react';
// import { Link, useParams } from 'react-router-dom';
// import { UserContext } from './App';
// import { castVote } from './cast-vote';
// import CreatePost from './CreatePost';
// import { supaClient } from './supa-client';
// import { timeAgo } from './time-ago';
// import UpVote from './UpVote';
// import usePostScore from './use-post-score';

// export default function AllPosts() {
//   const { session } = useContext(UserContext);
//   const { pageNumber } = useParams();
//   const [bumper, setBumper] = useState(0);
//   const [posts, setPosts] = useState([]);
//   const [myVotes, setMyVotes] = useState({});
//   const [sortOption, setSortOption] = useState('none');
//   const [searchText, setSearchText] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');

//   useEffect(() => {
//     const queryPageNumber = pageNumber ? +pageNumber : 1;
//     supaClient
//       .rpc('get_posts', { page_number: queryPageNumber })
//       .select('*')
//       .then(({ data }) => {
//         setPosts(data);
//         if (session?.user) {
//           supaClient
//             .from('post_votes')
//             .select('*')
//             .eq('user_id', session.user.id)
//             .then(({ data: votesData }) => {
//               if (!votesData) {
//                 return;
//               }
//               const votes = votesData.reduce((acc, vote) => {
//                 acc[vote.post_id] = vote.vote_type;
//                 return acc;
//               }, {});
//               setMyVotes(votes);
//             });
//         }
//       });
//   }, [session, bumper, pageNumber]);

//   const sortPosts = useCallback(() => {
//     let sortedPosts = [...posts];

//     if (sortOption === 'created_at') {
//       sortedPosts = sortedPosts.sort((a, b) => {
//         const timeAgoA = timeAgo(a.created_at);
//         const timeAgoB = timeAgo(b.created_at);
//         if (timeAgoA < timeAgoB) {
//           return -1;
//         } else if (timeAgoA > timeAgoB) {
//           return 1;
//         } else {
//           return 0;
//         }
//       });
//     } else if (sortOption === 'score-low-to-high') {
//       sortedPosts = sortedPosts.sort((a, b) => a.score - b.score);
//     } else if (sortOption === 'score-high-to-low') {
//       sortedPosts = sortedPosts.sort((a, b) => b.score - a.score);
//     }

//     if (searchQuery !== '') {
//       sortedPosts = sortedPosts.filter((post) =>
//         post.title.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     return sortedPosts;
//   }, [posts, sortOption, searchQuery]);

//   const sortedPosts = useMemo(() => sortPosts(), [sortPosts]);

//   const handleSearch = useCallback(
//     (event) => {
//       event.preventDefault();
//       setSearchQuery(searchText);
//       sortPosts();
//     },
//     [searchText]
//   );

//   const handleReset = useCallback(() => {
//     setSortOption('none');
//     setSearchText('');
//     setSearchQuery('');
//   }, []);

//   return (
//     <>
//       {session && (
//         <CreatePost
//           newPostCreated={() => {
//             setBumper(bumper + 1);
//           }}
//         />
//       )}

//       <div className="posts-filter">
//         <div className="search-filter">
//           <form onSubmit={handleSearch} className="search-form">
//             <label>
//               <input
//                 type="text"
//                 value={searchText}
//                 placeholder="Search post by title"
//                 onChange={(e) => setSearchText(e.target.value)}
//                 className="search-text"
//               />
//             </label>
//             <button type="submit" className="search-btn">
//               Search
//             </button>
//           </form>
//         </div>
//         <div className="dropdown-filter">
//           <label>
//             <select
//               value={sortOption}
//               onChange={(e) => setSortOption(e.target.value)}
//               className="dropdown-select"
//             >
//               <option value="none">View posts by</option>
//               <option value="created_at">Some newer posts</option>
//               <option value="score-low-to-high">Post score: Low to High</option>
//               <option value="score-high-to-low">Post score: High to Low</option>
//             </select>
//           </label>
//         </div>
//         <button onClick={handleReset} className="reset-filter">
//           Reset Filters
//         </button>
//       </div>

//       <div className="posts-container">
//         {sortedPosts?.map((post) => (
//           <Post
//             key={post.id}
//             postData={post}
//             myVote={myVotes?.[post.id] || undefined}
//             onVoteSuccess={() => {
//               setBumper(bumper + 1);
//             }}
//           />
//         )) ?? null}
//       </div>
//     </>
//   );
// }

// function Post({ postData, myVote, onVoteSuccess }) {
//   const score = usePostScore(postData.id, postData.score);
//   const { session } = useContext(UserContext);

//   return (
//     <div className="post-container">
//       <div className="post-upvote-container">
//         <UpVote
//           direction="up"
//           filled={myVote === 'up'}
//           enabled={!!session}
//           onClick={async () => {
//             await castVote({
//               postId: postData.id,
//               userId: session?.user.id,
//               voteType: 'up',
//               onSuccess: () => {
//                 onVoteSuccess();
//               },
//             });
//           }}
//         />
//         <p className="text-center" data-e2e="upvote-count">
//           {score}
//         </p>
//         <UpVote
//           direction="down"
//           filled={myVote === 'down'}
//           enabled={!!session}
//           onClick={async () => {
//             await castVote({
//               postId: postData.id,
//               userId: session?.user.id,
//               voteType: 'down',
//               onSuccess: () => {
//                 onVoteSuccess();
//               },
//             });
//           }}
//         />
//       </div>
//       <Link to={`/post/${postData.id}`} className="flex-auto">
//         <p className="mt-4">
//           Posted by {postData.username} {timeAgo(postData.created_at)} ago
//         </p>
//         <h3 className="text-2xl">{postData.title}</h3>
//       </Link>
//     </div>
//   );
// }

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
