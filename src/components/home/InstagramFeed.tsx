import Image from 'next/image';
import { INSTAGRAM } from '@/content/social';
import { getInstagramPosts } from '@/lib/instagram';
import { InstagramIcon } from '@/components/ui/icons';

/**
 * Latest posts of @jouwhockeystick. Renders nothing until there are posts
 * (or while no access token is configured). Images go through the site's
 * own image optimiser, so visitors' browsers never load anything from Meta.
 */
export async function InstagramFeed() {
  const posts = await getInstagramPosts(6);
  if (posts.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="instagram-heading"
      className="border-t border-rand bg-white"
    >
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-veld">
              Instagram
            </p>
            <h2 id="instagram-heading" className="mt-1 text-2xl font-bold">
              @{INSTAGRAM.handle}
            </h2>
          </div>
          <a
            href={INSTAGRAM.url}
            rel="me noopener noreferrer"
            target="_blank"
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-veld hover:underline"
          >
            <InstagramIcon size={20} />
            {INSTAGRAM.label}
          </a>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id}>
              <a
                href={post.permalink}
                rel="noopener noreferrer"
                target="_blank"
                className="group relative block aspect-square overflow-hidden rounded-xl bg-krijt"
              >
                <Image
                  src={post.imageUrl}
                  alt={post.alt}
                  fill
                  sizes="(min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
                {post.isVideo && (
                  <span className="absolute right-2 top-2 rounded-full bg-inkt/80 px-2 py-0.5 text-xs font-semibold text-white">
                    Video
                  </span>
                )}
                <span className="sr-only">Bekijk op Instagram</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
