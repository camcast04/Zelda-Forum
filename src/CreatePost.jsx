import React, { useContext, useRef, useState } from 'react';
import { UserContext } from './App';
import { supaClient } from './supa-client';

export default function CreatePost({ newPostCreated = () => {} }) {
  const { session } = useContext(UserContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);

  const createNewPost = ({ session, title, content }) => {
    return supaClient.rpc('create_new_post', {
      userId: session?.user.id || '',
      title,
      content,
    });
  };

  return (
    <form
      className="create-post-form"
      data-e2e="create-post-form"
      onSubmit={(event) => {
        event.preventDefault();
        createNewPost({ session, title, content }).then(({ error }) => {
          if (!error) {
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
        onChange={({ target }) => setTitle(target.value)}
      />
      <textarea
        name="contents"
        ref={contentInputRef}
        placeholder="Your content here"
        className="create-post-content-input"
        onChange={({ target }) => setContent(target.value)}
      />
      <div>
        <button type="submit" className="create-post-submit-button">
          Submit
        </button>
      </div>
    </form>
  );
}
