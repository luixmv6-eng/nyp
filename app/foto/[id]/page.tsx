import { notFound } from 'next/navigation';
import PhotoDetail from '@/components/PhotoDetail';
import { getPhoto } from '@/lib/photos';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Detalle del Recuerdo · Nuestro Árbol' };

export default async function FotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const photo = await getPhoto(id);
  if (!photo) notFound();

  return <PhotoDetail photo={photo} />;
}
