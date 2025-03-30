
-- Create a table for banners
CREATE TABLE IF NOT EXISTS public.banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT,
  video_url TEXT,
  media_type TEXT DEFAULT 'image',
  cta_text TEXT DEFAULT 'اكتشف المزيد',
  cta_link TEXT DEFAULT '/products',
  order INTEGER DEFAULT 0,
  slider_height INTEGER DEFAULT 70,
  text_color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add a trigger to update the updated_at column
CREATE TRIGGER update_banners_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Set up RLS for banners table
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Only admins can create/update banners
CREATE POLICY "Admins can manage banners" ON public.banners
FOR ALL USING (is_admin());

-- Anyone can view banners
CREATE POLICY "Anyone can view banners" ON public.banners
FOR SELECT USING (true);

-- Create a bucket for banner media if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Set up policy for storage
CREATE POLICY "Public can view banner files" ON storage.objects
FOR SELECT USING (bucket_id = 'banners');

CREATE POLICY "Only admins can upload banner files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'banners' AND is_admin());

CREATE POLICY "Only admins can update banner files" ON storage.objects
FOR UPDATE USING (bucket_id = 'banners' AND is_admin());

CREATE POLICY "Only admins can delete banner files" ON storage.objects
FOR DELETE USING (bucket_id = 'banners' AND is_admin());
