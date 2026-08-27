import Link from 'next/link';
import TreeView from '@/components/TreeView';
import Icon from '@/components/Icon';
import { listPhotos } from '@/lib/photos';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'El Árbol · Nuestro Árbol' };

export default async function ArbolPage() {
  const photos = await listPhotos();

  return (
    <main className="relative">
      <TreeView photos={photos} />

      {/* Botón flotante de latón envejecido */}
      <Link
        href="/subir"
        aria-label="Añadir un recuerdo"
        className="aged-bronze-fab group fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-circle transition-transform hover:scale-105 active:scale-95"
      >
        <Icon
          name="add"
          weight={600}
          className="engraved-icon text-3xl text-inverse-on-surface transition-transform duration-300 group-hover:rotate-90"
        />
      </Link>
    </main>
  );
}
