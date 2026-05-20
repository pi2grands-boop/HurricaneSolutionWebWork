/**
 * Tipos del sistema de blog.
 */

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;       // Auto-generado: primeros 200 chars sin HTML
  body: string;          // HTML del editor Quill
  image: string;         // Ruta relativa: /img/blog/filename.jpg
  category: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  keywords: string;      // Separados por coma
  status: 'draft' | 'published';
  date: string;          // Fecha formateada para mostrar: "12 de mayo de 2025"
  created_at: number;    // Unix timestamp ms
  updated_at: number;
}
