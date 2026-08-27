/**
 * Material Symbols Outlined — la misma familia de íconos que usa el diseño
 * de Stitch. La hoja de estilos se carga una sola vez en el layout raíz.
 */
export type IconName =
  | 'menu'
  | 'account_circle'
  | 'account_tree'
  | 'photo_library'
  | 'add_a_photo'
  | 'add_photo_alternate'
  | 'add'
  | 'arrow_back'
  | 'edit'
  | 'delete'
  | 'upload'
  | 'settings'
  | 'logout'
  | 'close'
  | 'check'
  | 'lock'
  | 'mail'
  | 'book_2'
  | 'history_edu'
  | 'image';

export default function Icon({
  name,
  className = '',
  fill = 0,
  weight = 300,
  style,
}: {
  name: IconName;
  className?: string;
  fill?: 0 | 1;
  weight?: number;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined select-none ${className}`}
      style={{ fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}`, ...style }}
    >
      {name}
    </span>
  );
}
