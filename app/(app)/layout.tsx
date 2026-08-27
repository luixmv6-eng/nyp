import AppShell from '@/components/AppShell';
import RealtimeRefresher from '@/components/RealtimeRefresher';
import LogoFirstRun from '@/components/LogoFirstRun';
import { getLogoVersion, logoPublicUrl } from '@/lib/logo';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const version = await getLogoVersion();

  return (
    <>
      <AppShell logoUrl={logoPublicUrl(192, version)}>{children}</AppShell>
      <RealtimeRefresher />
      {/* Primera vez: preguntamos por el logo. */}
      {!version && <LogoFirstRun />}
    </>
  );
}
