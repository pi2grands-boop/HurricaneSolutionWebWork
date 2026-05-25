/**
 * Tipos del sistema de blog — bilingüe + programación.
 */

export interface BlogPost {
  id:               string;
  lang:             'es' | 'en';      // Idioma del post
  canonical_slug:   string;           // URL compartida ES+EN: /blog/<canonical_slug>
  title:            string;
  slug:             string;           // Alias de canonical_slug (compatibilidad)
  excerpt:          string;
  body:             string;
  image:            string;
  category:         string;
  tags:             string[];
  meta_title:       string;
  meta_description: string;
  keywords:         string;
  status:           'draft' | 'scheduled' | 'published';
  scheduled_at?:    number;           // Unix ms — cuándo publicar si status=scheduled
  date:             string;           // Formateado para mostrar
  created_at:       number;
  updated_at:       number;
}
