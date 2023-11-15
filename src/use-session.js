// user-session.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supaClient } from './supa-client';

export default function useSession() {
  const [userInfo, setUserInfo] = useState({ profile: null, session: null });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supaClient.auth.getSession();
      console.log('Current session:', session);
      setUserInfo((prev) => ({ ...prev, session }));
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const { user } = userInfo.session || {};
    if (user) {
      const listenToUserProfileChanges = async (userId) => {
        const { data, error } = await supaClient
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId);

        console.log('User profile data:', data, 'Error:', error);

        if (data?.length) {
          setUserInfo((prev) => ({ ...prev, profile: data[0] }));
        } else {
          navigate('/welcome');
        }
      };

      listenToUserProfileChanges(user.id);
    } else {
      console.log('No user session found');
    }
  }, [userInfo.session, navigate]);

  return userInfo;
}
