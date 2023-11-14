import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supaClient } from './supa-client';

export const setReturnPath = () => {
  localStorage.setItem('returnPath', window.location.pathname);
};

export default function useSession() {
  const [userInfo, setUserInfo] = useState({
    profile: null,
    session: null,
  });
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    supaClient.auth.getSession().then(({ data: { session } }) => {
      setUserInfo({ ...userInfo, session });
      supaClient.auth.onAuthStateChange((_event, session) => {
        setUserInfo({ session, profile: null });
      });
    });
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo.session?.user && !userInfo.profile) {
      listenToUserProfileChanges(userInfo.session.user.id, navigate).then(
        (newChannel) => {
          if (channel) {
            channel.unsubscribe();
          }
          setChannel(newChannel);
        }
      );
    } else if (!userInfo.session?.user) {
      channel?.unsubscribe();
      setChannel(null);
    }
  }, [userInfo.session, navigate]);

  // async function listenToUserProfileChanges(userId, navigate) {
  //   const { data } = await supaClient
  //     .from('user_profiles')
  //     .select('*')
  //     .filter('user_id', 'eq', userId);

  async function listenToUserProfileChanges(userId) {
    const { data } = await supaClient
      .from('user_profiles')
      .select('*')
      .filter('user_id', 'eq', userId);
    if (!data?.length) {
      setReturnPath();
      navigate('/welcome');
    }

    if (data?.[0]) {
      setUserInfo({ ...userInfo, profile: data[0] });
    } else {
      localStorage.setItem('returnPath', window.location.pathname);
      navigate('/welcome');
    }

    return supaClient
      .channel(`public:user_profiles`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setUserInfo({ ...userInfo, profile: payload.new });
        }
      )
      .subscribe();
  }

  return userInfo;
}
