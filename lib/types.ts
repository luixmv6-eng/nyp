export type Photo = {
  id: string;
  /** Ruta del objeto dentro del bucket privado `photos`, no una URL pública. */
  image_url: string;
  caption: string | null;
  photo_date: string; // YYYY-MM-DD
  /** Sin cuentas siempre va vacío. Se queda por si se vuelven a añadir. */
  uploaded_by: string | null;
  /** Borrado lógico: si tiene fecha, la foto no se muestra. */
  deleted_at: string | null;
  created_at: string;
};

export type AppSetting = {
  key: string;
  value: string;
  updated_at: string;
  updated_by: string | null;
};
