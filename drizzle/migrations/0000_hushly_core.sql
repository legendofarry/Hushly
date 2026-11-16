
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  birthdate date,
  gender text NOT NULL DEFAULT 'woman' CHECK (gender IN ('woman','man','nonbinary')),
  interested_in text NOT NULL DEFAULT 'everyone' CHECK (interested_in IN ('women','men','everyone')),
  bio text NOT NULL DEFAULT '',
  job text NOT NULL DEFAULT '',
  school text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  photos text[] NOT NULL DEFAULT '{}',
  interests text[] NOT NULL DEFAULT '{}',
  onboarded boolean NOT NULL DEFAULT false,
  is_demo boolean NOT NULL DEFAULT false,
  demo_persona text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;
GRANT EXECUTE ON FUNCTION public.current_profile_id() TO authenticated;

CREATE POLICY "Members view onboarded or own profile" ON public.profiles
  FOR SELECT TO authenticated USING (onboarded OR user_id = auth.uid());
CREATE POLICY "Users create own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND is_demo = false);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND is_demo = false);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Swipes
CREATE TABLE public.swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('like','nope','super')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (swiper_id, target_id),
  CHECK (swiper_id <> target_id)
);
GRANT SELECT, INSERT, DELETE ON public.swipes TO authenticated;
GRANT ALL ON public.swipes TO service_role;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own swipes" ON public.swipes
  FOR SELECT TO authenticated USING (swiper_id = public.current_profile_id());
CREATE POLICY "Users create own swipes" ON public.swipes
  FOR INSERT TO authenticated WITH CHECK (swiper_id = public.current_profile_id());
CREATE POLICY "Users undo own swipes" ON public.swipes
  FOR DELETE TO authenticated USING (swiper_id = public.current_profile_id());

-- Matches
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_a uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_b uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  super_like boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz,
  UNIQUE (profile_a, profile_b),
  CHECK (profile_a < profile_b)
);
GRANT SELECT, DELETE ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view their matches" ON public.matches
  FOR SELECT TO authenticated USING (public.current_profile_id() IN (profile_a, profile_b));
CREATE POLICY "Members unmatch" ON public.matches
  FOR DELETE TO authenticated USING (public.current_profile_id() IN (profile_a, profile_b));

CREATE OR REPLACE FUNCTION public.is_match_member(_match_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = _match_id AND public.current_profile_id() IN (m.profile_a, m.profile_b)
  )
$$;
GRANT EXECUTE ON FUNCTION public.is_match_member(uuid) TO authenticated;

-- Messages
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);
CREATE INDEX messages_match_idx ON public.messages (match_id, created_at);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read match messages" ON public.messages
  FOR SELECT TO authenticated USING (public.is_match_member(match_id));
CREATE POLICY "Members send match messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (sender_id = public.current_profile_id() AND public.is_match_member(match_id));

CREATE OR REPLACE FUNCTION public.mark_match_read(_match_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.messages SET read_at = now()
  WHERE match_id = _match_id AND read_at IS NULL
    AND sender_id <> public.current_profile_id()
    AND public.is_match_member(_match_id);
$$;
GRANT EXECUTE ON FUNCTION public.mark_match_read(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.bump_match_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.matches SET last_message_at = NEW.created_at WHERE id = NEW.match_id;
  RETURN NEW;
END $$;
CREATE TRIGGER messages_bump AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_match_activity();

-- Match creation on mutual like (sample profiles like back ~70%, always for super likes)
CREATE OR REPLACE FUNCTION public.handle_swipe()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  target_demo boolean;
  is_match boolean := false;
BEGIN
  IF NEW.direction = 'nope' THEN RETURN NEW; END IF;
  SELECT is_demo INTO target_demo FROM public.profiles WHERE id = NEW.target_id;
  IF target_demo THEN
    is_match := NEW.direction = 'super' OR random() < 0.7;
  ELSE
    is_match := EXISTS (
      SELECT 1 FROM public.swipes s
      WHERE s.swiper_id = NEW.target_id AND s.target_id = NEW.swiper_id AND s.direction IN ('like','super')
    );
  END IF;
  IF is_match THEN
    INSERT INTO public.matches (profile_a, profile_b, super_like)
    VALUES (LEAST(NEW.swiper_id, NEW.target_id), GREATEST(NEW.swiper_id, NEW.target_id), NEW.direction = 'super')
    ON CONFLICT (profile_a, profile_b) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER swipes_match AFTER INSERT ON public.swipes
  FOR EACH ROW EXECUTE FUNCTION public.handle_swipe();

-- Discovery deck
CREATE OR REPLACE FUNCTION public.discover_profiles(_limit int DEFAULT 20)
RETURNS SETOF public.profiles LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT p.* FROM public.profiles p
  JOIN public.profiles me ON me.user_id = auth.uid()
  WHERE p.id <> me.id AND p.onboarded
    AND NOT EXISTS (SELECT 1 FROM public.swipes s WHERE s.swiper_id = me.id AND s.target_id = p.id)
    AND (me.interested_in = 'everyone'
      OR (me.interested_in = 'women' AND p.gender = 'woman')
      OR (me.interested_in = 'men' AND p.gender = 'man'))
  ORDER BY p.is_demo ASC, random()
  LIMIT LEAST(_limit, 50)
$$;
GRANT EXECUTE ON FUNCTION public.discover_profiles(int) TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;

-- Sample profiles
INSERT INTO public.profiles (name, birthdate, gender, interested_in, bio, job, school, city, photos, interests, onboarded, is_demo, demo_persona) VALUES
('Amara', '1997-04-12', 'woman', 'everyone', 'Rooftop sunsets, strong espresso and terrible puns. Looking for someone who laughs first and apologises later.', 'Product Designer', 'University of Lisbon', 'Nairobi', ARRAY['/people/amara.jpg'], ARRAY['Design','Coffee','Salsa','Travel'], true, true, 'Warm, witty product designer who loves sunsets and bad puns. Playful and curious.'),
('Daniel', '1995-09-03', 'man', 'everyone', 'Weekend barista, weekday engineer. I will judge your coffee order, lovingly.', 'Software Engineer', 'TU Berlin', 'Nairobi', ARRAY['/people/daniel.jpg'], ARRAY['Coffee','Cycling','Jazz','Cooking'], true, true, 'Laid-back engineer obsessed with coffee. Dry humour, asks thoughtful questions.'),
('Sofia', '1999-01-22', 'woman', 'everyone', 'Happiest at 2,000 metres. Will trade trail snacks for good conversation.', 'Physiotherapist', 'University of Zurich', 'Nairobi', ARRAY['/people/sofia.jpg'], ARRAY['Hiking','Yoga','Camping','Dogs'], true, true, 'Bubbly outdoorsy physio who loves hiking. Energetic, uses the occasional emoji.'),
('Kofi', '1996-06-18', 'man', 'everyone', 'City lights and vinyl nights. Ask me about the best jollof in town (it is mine).', 'Music Producer', 'University of Ghana', 'Nairobi', ARRAY['/people/kofi.jpg'], ARRAY['Music','Vinyl','Cooking','Football'], true, true, 'Confident, charming music producer. Teases gently, loves talking food and music.'),
('Priya', '1998-11-05', 'woman', 'everyone', 'Museum dates > movie dates. Tell me the last thing that gave you goosebumps.', 'Art Curator', 'University of Mumbai', 'Nairobi', ARRAY['/people/priya.jpg'], ARRAY['Art','Museums','Poetry','Tea'], true, true, 'Thoughtful art curator. Romantic, asks deep questions, likes poetry.'),
('Kenji', '1998-02-14', 'man', 'everyone', 'I write songs about people I meet on here. No pressure.', 'UX Researcher', 'Keio University', 'Nairobi', ARRAY['/people/kenji.jpg'], ARRAY['Guitar','Books','Ramen','Board games'], true, true, 'Gentle, nerdy UX researcher and guitarist. Self-deprecating humour.'),
('Wanjiru', '1996-08-30', 'woman', 'everyone', 'Beach at sunset, dancing till sunrise. Bring good energy and better playlists.', 'Marketing Lead', 'Strathmore University', 'Nairobi', ARRAY['/people/wanjiru.jpg'], ARRAY['Dancing','Beach','Afrobeats','Brunch'], true, true, 'Radiant, outgoing marketing lead from Nairobi. Fun, flirty, loves dancing.'),
('Mateo', '1994-12-09', 'man', 'everyone', 'I cook, you pick the wine. Deal?', 'Chef', 'Le Cordon Bleu', 'Nairobi', ARRAY['/people/mateo.jpg'], ARRAY['Cooking','Wine','Travel','Salsa'], true, true, 'Passionate, warm chef. Talks about food a lot, generous and funny.'),
('Lena', '1997-07-01', 'woman', 'everyone', 'Bookworm with a picnic blanket permanently in my bag. Currently re-reading everything.', 'Editor', 'Trinity College Dublin', 'Nairobi', ARRAY['/people/lena.jpg'], ARRAY['Books','Picnics','Writing','Cats'], true, true, 'Soft-spoken book editor, dry wit, loves recommending books.'),
('Noah', '1996-03-27', 'man', 'everyone', 'Dawn patrol surfer. I promise I own clothes that are not wetsuits.', 'Marine Biologist', 'University of Cape Town', 'Nairobi', ARRAY['/people/noah.jpg'], ARRAY['Surfing','Ocean','Photography','Travel'], true, true, 'Sunny, adventurous marine biologist and surfer. Easygoing and enthusiastic.'),
('Aisha', '1999-05-16', 'woman', 'everyone', 'Market strolls, spice hunting and long voice notes. Show me your favourite corner of the city.', 'Architect', 'American University in Cairo', 'Nairobi', ARRAY['/people/aisha.jpg'], ARRAY['Architecture','Food','Photography','Travel'], true, true, 'Curious, kind architect who loves markets and food. Sweet and articulate.'),
('Lucas', '1993-10-11', 'man', 'everyone', 'Me and Biscuit (the dog) are a package deal. He approves of you already.', 'Veterinarian', 'Utrecht University', 'Nairobi', ARRAY['/people/lucas.jpg'], ARRAY['Dogs','Hiking','Baking','Camping'], true, true, 'Kind, goofy vet who talks about his golden retriever Biscuit constantly.');
