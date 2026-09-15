
-- ============ helpers ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- ============ profiles ============
CREATE TYPE public.location_precision AS ENUM ('exact','approximate');
CREATE TYPE public.profile_visibility AS ENUM ('public','members','hidden');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  age integer,
  gender text,
  bio text,
  phone text,
  whatsapp text,
  seeking text[] NOT NULL DEFAULT '{}',
  relationship_goal text,
  location_label text,
  location_area text,
  latitude double precision,
  longitude double precision,
  approx_latitude double precision,
  approx_longitude double precision,
  location_precision public.location_precision NOT NULL DEFAULT 'approximate',
  visibility public.profile_visibility NOT NULL DEFAULT 'public',
  is_published boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  is_suspended boolean NOT NULL DEFAULT false,
  popularity_score integer NOT NULL DEFAULT 0,
  view_count integer NOT NULL DEFAULT 0,
  completion_percent integer NOT NULL DEFAULT 0,
  onboarding_step integer NOT NULL DEFAULT 0,
  onboarding_complete boolean NOT NULL DEFAULT false,
  live_beta_optin boolean NOT NULL DEFAULT false,
  last_active_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT username_format CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,20}$'),
  CONSTRAINT age_range CHECK (age IS NULL OR (age >= 18 AND age <= 99))
);
CREATE INDEX profiles_published_idx ON public.profiles (is_published, last_active_at DESC);
CREATE INDEX profiles_featured_idx ON public.profiles (is_featured) WHERE is_featured;
CREATE INDEX profiles_popularity_idx ON public.profiles (popularity_score DESC);
CREATE INDEX profiles_username_idx ON public.profiles (lower(username));

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT (id, username, display_name, age, gender, bio, seeking, relationship_goal,
  location_label, location_area, approx_latitude, approx_longitude, location_precision,
  visibility, is_published, is_featured, popularity_score, view_count, completion_percent,
  last_active_at, created_at) ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public profiles are viewable" ON public.profiles FOR SELECT TO anon, authenticated
  USING (is_published AND NOT is_suspended AND visibility = 'public');
CREATE POLICY "own profile viewable" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "admins view profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NULL))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.is_username_available(_username text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _username ~ '^[a-z0-9_]{3,20}$'
     AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE lower(username) = lower(_username));
$$;
GRANT EXECUTE ON FUNCTION public.is_username_available(text) TO anon, authenticated;

-- ============ photos ============
CREATE TABLE public.profile_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  storage_path text,
  position integer NOT NULL DEFAULT 0,
  is_main boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX profile_photos_profile_idx ON public.profile_photos (profile_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_photos TO authenticated;
GRANT SELECT ON public.profile_photos TO anon;
GRANT ALL ON public.profile_photos TO service_role;
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos of public profiles" ON public.profile_photos FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.is_published AND NOT p.is_suspended AND p.visibility='public'));
CREATE POLICY "own photos" ON public.profile_photos FOR ALL TO authenticated
  USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- ============ tags ============
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  category text NOT NULL DEFAULT 'interest',
  emoji text,
  is_active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.tags TO anon, authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags are public" ON public.tags FOR SELECT TO anon, authenticated USING (is_active);

CREATE TABLE public.profile_tags (
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, tag_id)
);
GRANT SELECT, INSERT, DELETE ON public.profile_tags TO authenticated;
GRANT SELECT ON public.profile_tags TO anon;
GRANT ALL ON public.profile_tags TO service_role;
ALTER TABLE public.profile_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile tags of public profiles" ON public.profile_tags FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.is_published AND NOT p.is_suspended AND p.visibility='public'));
CREATE POLICY "own profile tags" ON public.profile_tags FOR ALL TO authenticated
  USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

INSERT INTO public.tags (slug, label, category, emoji) VALUES
 ('travel','Travel','interest','✈️'),('fitness','Fitness','interest','💪'),('music','Music','interest','🎧'),
 ('foodie','Foodie','interest','🍜'),('movies','Movies','interest','🎬'),('reading','Reading','interest','📚'),
 ('gaming','Gaming','interest','🎮'),('art','Art','interest','🎨'),('dancing','Dancing','interest','💃'),
 ('nature','Nature','interest','🌿'),('photography','Photography','interest','📷'),('coffee','Coffee','interest','☕'),
 ('football','Football','interest','⚽'),('road-trips','Road trips','interest','🚗'),('faith','Faith','interest','🙏'),
 ('outgoing','Outgoing','personality','🌞'),('romantic','Romantic','personality','💗'),('adventurous','Adventurous','personality','🧗'),
 ('mature','Mature','personality','🍷'),('funny','Funny','personality','😄'),('calm','Calm','personality','🌙'),
 ('ambitious','Ambitious','personality','🚀'),('loyal','Loyal','personality','🤝'),('spontaneous','Spontaneous','personality','⚡'),
 ('professional','Professional','lifestyle','💼'),('student','Student','lifestyle','🎓'),('entrepreneur','Entrepreneur','lifestyle','📈'),
 ('nightlife','Nightlife','lifestyle','🌃'),('homebody','Homebody','lifestyle','🏡'),('pet-lover','Pet lover','lifestyle','🐶'),
 ('long-term','Long term','relationship','💍'),('casual-dating','Casual dating','relationship','🥂'),
 ('friendship','Friendship','relationship','🫶'),('open-to-anything','Open to anything','relationship','🌈');

-- ============ membership ============
CREATE TYPE public.membership_status AS ENUM ('draft','payment_pending','pending_approval','approved','rejected','expired','suspended');

CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_code text NOT NULL DEFAULT 'premium_monthly',
  amount_kes integer NOT NULL DEFAULT 500,
  status public.membership_status NOT NULL DEFAULT 'draft',
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.memberships TO authenticated;
GRANT ALL ON public.memberships TO service_role;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own membership" ON public.memberships FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "create own membership" ON public.memberships FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "update own membership" ON public.memberships FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER memberships_updated BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.payment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  membership_id uuid REFERENCES public.memberships(id) ON DELETE SET NULL,
  payer_name text NOT NULL,
  amount_kes integer NOT NULL DEFAULT 500,
  method text NOT NULL DEFAULT 'mpesa',
  reference_text text,
  proof_url text,
  status public.membership_status NOT NULL DEFAULT 'pending_approval',
  admin_note text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX one_pending_submission ON public.payment_submissions (user_id) WHERE status = 'pending_approval';
GRANT SELECT, INSERT ON public.payment_submissions TO authenticated;
GRANT ALL ON public.payment_submissions TO service_role;
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own submissions" ON public.payment_submissions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "create own submission" ON public.payment_submissions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE TRIGGER payment_submissions_updated BEFORE UPDATE ON public.payment_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ notifications ============
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_key text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  body text,
  icon text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON public.notifications (user_id, created_at DESC);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============ chat ============
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ordered_pair CHECK (user_a < user_b),
  UNIQUE (user_a, user_b)
);
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own conversations" ON public.conversations FOR SELECT TO authenticated USING (auth.uid() IN (user_a, user_b));
CREATE POLICY "create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() IN (user_a, user_b));
CREATE POLICY "touch conversations" ON public.conversations FOR UPDATE TO authenticated USING (auth.uid() IN (user_a, user_b)) WITH CHECK (auth.uid() IN (user_a, user_b));

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text,
  image_url text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_conversation_idx ON public.messages (conversation_id, created_at);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read messages in own conversations" ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND auth.uid() IN (c.user_a, c.user_b)));
CREATE POLICY "send own messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND auth.uid() IN (c.user_a, c.user_b)));
CREATE POLICY "mark messages read" ON public.messages FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND auth.uid() IN (c.user_a, c.user_b)));

CREATE TABLE public.message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);
GRANT SELECT, INSERT, DELETE ON public.message_reactions TO authenticated;
GRANT ALL ON public.message_reactions TO service_role;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reactions in own conversations" ON public.message_reactions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.messages m JOIN public.conversations c ON c.id = m.conversation_id
                 WHERE m.id = message_id AND auth.uid() IN (c.user_a, c.user_b)));
CREATE POLICY "own reactions" ON public.message_reactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "remove own reactions" ON public.message_reactions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============ safety ============
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  target_message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reports" ON public.reports FOR SELECT TO authenticated USING (reporter_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "create reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());

CREATE TABLE public.blocks (
  blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);
GRANT SELECT, INSERT, DELETE ON public.blocks TO authenticated;
GRANT ALL ON public.blocks TO service_role;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own blocks" ON public.blocks FOR ALL TO authenticated USING (blocker_id = auth.uid()) WITH CHECK (blocker_id = auth.uid());

CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  attachment_url text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "create tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- ============ settings / analytics / config ============
CREATE TABLE public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notify_messages boolean NOT NULL DEFAULT true,
  notify_system boolean NOT NULL DEFAULT true,
  notify_membership boolean NOT NULL DEFAULT true,
  notify_promotions boolean NOT NULL DEFAULT false,
  show_activity boolean NOT NULL DEFAULT true,
  discoverable boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_preferences TO service_role;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own preferences" ON public.user_preferences FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.security_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  biometric_enabled boolean NOT NULL DEFAULT false,
  app_lock_enabled boolean NOT NULL DEFAULT false,
  lock_after_minutes integer NOT NULL DEFAULT 5,
  lock_on_background boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.security_settings TO authenticated;
GRANT ALL ON public.security_settings TO service_role;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own security settings" ON public.security_settings FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name text NOT NULL,
  subject_id uuid,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX analytics_events_name_idx ON public.analytics_events (event_name, created_at DESC);
GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can log events" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "admins read events" ON public.analytics_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.platform_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_config TO anon, authenticated;
GRANT ALL ON public.platform_config TO service_role;
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "config readable" ON public.platform_config FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.platform_config (key, value) VALUES
 ('membership', '{"plan":"premium_monthly","amount_kes":500,"mpesa":"0715938110"}'::jsonb),
 ('support', '{"email":"moderation.mails.go@gmail.com","whatsapp":"0762634893"}'::jsonb),
 ('ranking', '{"popular_min_views":0,"featured_limit":8}'::jsonb);

-- profile view counter
CREATE OR REPLACE FUNCTION public.increment_profile_view(_username text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.profiles SET view_count = view_count + 1, popularity_score = popularity_score + 1
  WHERE lower(username) = lower(_username) AND is_published;
$$;
GRANT EXECUTE ON FUNCTION public.increment_profile_view(text) TO anon, authenticated;
