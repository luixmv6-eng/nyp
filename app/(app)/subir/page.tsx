import UploadForm from '@/components/UploadForm';

export const metadata = { title: 'Subir un Recuerdo · Nuestro Árbol' };

export default function SubirPage() {
  return (
    <main className="flex flex-col items-center px-6 pb-16 pt-8">
      <UploadForm />
    </main>
  );
}
