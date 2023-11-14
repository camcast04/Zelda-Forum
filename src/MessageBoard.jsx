import { useContext, useEffect } from 'react';
import {
  Link,
  Outlet,
  useParams,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { UserContext } from './App';
import Login from './Login';

export default function MessageBoard() {
  const userProfile = useContext(UserContext);
  const { pageNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to '/1' if no pageNumber and not a post detail page
  useEffect(() => {
    if (!pageNumber && !location.pathname.includes('post')) {
      navigate('/1');
    }
  }, [pageNumber, location.pathname, navigate]);

  return (
    <div className="message-board-container">
      <Link to="/1">
        <h2 className="message-board-header-link">The Zelda Forum</h2>
      </Link>
      {!userProfile.session && (
        <h2
          className="message-board-login-message"
          data-e2e="message-board-login"
        >
          Please <Login /> to join in the discussion.
        </h2>
      )}
      <Outlet />
    </div>
  );
}
