import { redirect } from 'next/navigation';

/**
 * `/` es el start_url de la PWA. No pinta nada: manda directo al árbol.
 * La apertura del álbum la hace <AlbumIntro>, que vive en el layout raíz y se
 * superpone a todo, así que esta navegación ocurre por debajo de la tapa.
 */
export default function Home() {
  redirect('/arbol');
}
