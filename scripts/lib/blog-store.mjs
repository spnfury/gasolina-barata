/**
 * Almacén compartido de src/data/blog-posts.json.
 *
 * Invariante: una ejecución nunca puede eliminar un post ya publicado.
 *
 * Cada slug del JSON es una URL indexada y `blog/[slug]` se construye con
 * dynamicParams=false, así que quitar un slug del fichero convierte esa URL
 * en un 404. El crecimiento del archivo se limita al GENERAR, nunca borrando.
 */

import fs from 'fs';
import path from 'path';

export function readPosts(file) {
    if (!fs.existsSync(file)) return [];
    try {
        const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

/**
 * Guarda la lista de posts. Lanza si la escritura eliminaría algún slug
 * presente en el fichero actual.
 */
export function writePosts(file, posts) {
    if (!Array.isArray(posts)) {
        throw new TypeError('writePosts espera un array de posts');
    }

    const before = new Set(readPosts(file).map((p) => p.slug));
    const after = new Set(posts.map((p) => p.slug));
    const removed = [...before].filter((slug) => !after.has(slug));

    if (removed.length) {
        const muestra = removed.slice(0, 10).join(', ');
        throw new Error(
            `Escritura abortada: eliminaría ${removed.length} post(s) ya publicados, ` +
            `que pasarían a devolver 404 (dynamicParams=false en blog/[slug]). ` +
            `Slugs: ${muestra}${removed.length > 10 ? ', …' : ''}`
        );
    }

    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(posts, null, 2));

    return {
        total: posts.length,
        added: [...after].filter((slug) => !before.has(slug)).length,
    };
}
