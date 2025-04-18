
import type { Banner } from '@/data/initialData';
import { DbBanner } from '@/services/banners/bannerService';

export function mapDbBannerToBanner(dbBanner: DbBanner): Banner {
  return {
    id: dbBanner.id,
    title: dbBanner.title,
    subtitle: dbBanner.subtitle || undefined,
    image: dbBanner.image || undefined,
    videoUrl: dbBanner.video_url || undefined,
    mediaType: (dbBanner.media_type as "image" | "video") || "image",
    ctaText: dbBanner.cta_text || undefined,
    ctaLink: dbBanner.cta_link || undefined,
    orderIndex: dbBanner.order_index,
    sliderHeight: dbBanner.slider_height || undefined,
    textColor: dbBanner.text_color || undefined,
  };
}

// Updated to generate a new ID and include it in the returned object
export function mapBannerToDbBanner(banner: Omit<Banner, 'id'>): Omit<DbBanner, 'created_at' | 'updated_at'> {
  // Generate a new ID for the banner
  const id = crypto.randomUUID();
  
  return {
    id, // Include the generated ID
    title: banner.title,
    subtitle: banner.subtitle || null,
    image: banner.image || null,
    video_url: banner.videoUrl || null,
    media_type: banner.mediaType,
    cta_text: banner.ctaText || null,
    cta_link: banner.ctaLink || null,
    order_index: banner.orderIndex,
    slider_height: banner.sliderHeight || null,
    text_color: banner.textColor || null,
  };
}
