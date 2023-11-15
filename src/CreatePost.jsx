//CreatePost.jsx
import React, { useContext, useRef, useState } from 'react';
import { UserContext } from './App';
import { supaClient } from './supa-client';

const createNewPost = ({ session, title, content }) => {
  return supaClient.rpc('create_new_post', {
    user_id: session?.user.id || '', // Adjusted parameter name to 'user_id' and moved it to the first position
    title, // Second argument
    content, // Third argument
  });
};

export default function CreatePost({ newPostCreated = () => {} }) {
  const { session } = useContext(UserContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);

  return (
    <form
      className="create-post-form"
      data-e2e="create-post-form"
      onSubmit={(event) => {
        event.preventDefault();
        createNewPost({ session, title, content }).then(({ error }) => {
          if (error) {
            console.log(error);
          } else {
            setTitle('');
            setContent('');
            if (titleInputRef.current) {
              titleInputRef.current.value = '';
            }
            if (contentInputRef.current) {
              contentInputRef.current.value = '';
            }
            newPostCreated();
          }
        });
      }}
    >
      <h3>Create A New Post</h3>
      <input
        type="text"
        name="title"
        ref={titleInputRef}
        className="create-post-title-input"
        placeholder="Your Title Here"
        onChange={({ target: { value } }) => setTitle(value)}
      />
      <textarea
        name="contents"
        ref={contentInputRef}
        placeholder="Your content here"
        className="create-post-content-input"
        onChange={({ target: { value } }) => setContent(value)}
      />
      <div>
        <button type="submit" className="create-post-submit-button">
          Submit
        </button>
      </div>
    </form>
  );
}
