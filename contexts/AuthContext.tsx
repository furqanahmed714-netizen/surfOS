import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from 'https://esm.sh/@supabase/supabase-js@2';
import { supabase, Profile } from '../lib/supabase';
import type { SubscriptionCheckResponse } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  subscriptionCheckInProgress: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: Error | null; subscriptionDenied?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; subscriptionDenied?: boolean }>;
  signOut: () => Promise<void>;
  checkSubscription: (email: string) => Promise<SubscriptionCheckResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionCheckInProgress, setSubscriptionCheckInProgress] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.email) {
        const subscriptionCheck = await checkSubscription(session.user.email);
        if (!subscriptionCheck.allowed) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        setSession(session);
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    });

    const periodicSubscriptionCheck = setInterval(() => {
      (async () => {
        const currentSession = await supabase.auth.getSession();
        if (currentSession.data.session?.user?.email) {
          const subscriptionCheck = await checkSubscription(currentSession.data.session.user.email);
          if (!subscriptionCheck.allowed) {
            await supabase.auth.signOut();
            window.location.reload();
          }
        }
      })();
    }, 5 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(periodicSubscriptionCheck);
    };
  }, []);

  const checkSubscription = async (email: string): Promise<SubscriptionCheckResponse> => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-subscription`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        return { allowed: false, error: 'Failed to check subscription' };
      }

      const data: SubscriptionCheckResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Subscription check error:', error);
      return { allowed: false, error: 'Failed to check subscription' };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const subscriptionCheck = await checkSubscription(email);

    if (!subscriptionCheck.allowed) {
      return { error: null, subscriptionDenied: true };
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) return { error };

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
        });

      if (profileError) return { error: profileError as unknown as Error };
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    setSubscriptionCheckInProgress(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setSubscriptionCheckInProgress(false);
      return { error };
    }

    if (data.user?.email) {
      const subscriptionCheck = await checkSubscription(data.user.email);

      if (!subscriptionCheck.allowed) {
        await supabase.auth.signOut();
        setSubscriptionCheckInProgress(false);
        return { error: null, subscriptionDenied: true };
      }

      setSession(data.session);
      setUser(data.user);
      await fetchProfile(data.user.id);
    }

    setSubscriptionCheckInProgress(false);
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, subscriptionCheckInProgress, signUp, signIn, signOut, checkSubscription }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
