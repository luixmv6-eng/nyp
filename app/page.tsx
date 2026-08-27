import SplashCover from '@/components/SplashCover';
import { getLogoVersion, logoPublicUrl } from '@/lib/logo';

// La portada se pinta en cada arranque, así que no la cacheamos de más.
export const revalidate = 3600;

export default async function SplashPage() {
  const version = await getLogoVersion();
  return <SplashCover logoUrl={logoPublicUrl(512, version)} />;
}
