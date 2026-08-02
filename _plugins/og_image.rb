# Points each post's og:image at its generated share card. Cards are built by
# scripts/og-images.mjs and are gitignored, so fall back to the site default
# whenever one is missing (e.g. a jekyll-only build with no asset step).
module GoFranz
  class OgImages < Jekyll::Generator
    safe true
    priority :low

    SITE_DEFAULT = '/assets/images/og-default.png'.freeze

    def generate(site)
      site.posts.docs.each do |post|
        current = post.data['image']
        next unless current.nil? || current == SITE_DEFAULT

        slug = File.basename(post.path, '.*').sub(/\A\d{4}-\d{1,2}-\d{1,2}-/, '')
        card = File.join('assets', 'images', 'og', "#{slug}.png")
        post.data['image'] = "/#{card}" if File.exist?(File.join(site.source, card))
      end
    end
  end
end
