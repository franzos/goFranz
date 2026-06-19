require 'fileutils'

module Jekyll
  # Emits a plain-markdown twin of every markdown page/document at <url>.md,
  # so LLMs and agents can fetch clean source instead of parsing rendered HTML.
  module RawMarkdown
    module_function

    # /blog/foo/ -> /blog/foo.md ; /about.html -> /about.md ; / -> /index.md
    def rel_md_path(url)
      return nil if url.nil?
      rel = url.sub(/\.html\z/, '').chomp('/')
      rel = '/index' if rel.empty?
      "#{rel}.md"
    end

    def markdown_source?(item)
      ext = File.extname(item.path.to_s).downcase
      ['.md', '.markdown'].include?(ext)
    end

    # Expand Liquid (includes, raw blocks, variables) but NOT markdown, so the
    # twin is real source rather than leaked {% %} tags. Falls back to raw on error.
    def render_liquid(site, item, raw)
      payload = site.site_payload
      payload['page'] = item.to_liquid
      info = {
        registers: { site: site, page: payload['page'] },
        strict_filters: false,
        strict_variables: false,
      }
      site.liquid_renderer.file(item.path).parse(raw).render!(payload, info)
    rescue StandardError => e
      Jekyll.logger.warn 'RawMarkdown:', "Liquid render failed for #{item.path}, using raw (#{e.message})"
      raw
    end

    def render(site, item, raw)
      title = item.data['title'] || item.data['name']
      out = +''
      out << "# #{title}\n\n" unless title.to_s.empty?
      out << "Source: #{site.config['url']}#{item.url}\n\n"
      out << render_liquid(site, item, raw)
      out
    end
  end

  # Stash the pre-render markdown before Liquid/kramdown touch it.
  Hooks.register [:documents, :pages], :pre_render do |item|
    item.data['raw_content'] = item.content
  end

  # Write the .md twins straight to the destination, bypassing kramdown.
  Hooks.register :site, :post_write do |site|
    (site.documents + site.pages).each do |item|
      next unless item.write?
      next unless RawMarkdown.markdown_source?(item)
      # Work entries are image-heavy showcases; their twins would be mostly markup.
      next if item.respond_to?(:collection) && item.collection&.label == 'work'

      raw = item.data['raw_content']
      next if raw.nil? || raw.strip.empty?

      rel = RawMarkdown.rel_md_path(item.url)
      next if rel.nil?

      dest = File.join(site.dest, rel)
      FileUtils.mkdir_p(File.dirname(dest))
      File.write(dest, RawMarkdown.render(site, item, raw))
    end
  end

  # {{ page.url | md_url }} -> the twin's path, single source of truth for the scheme.
  module MdUrlFilter
    def md_url(url)
      Jekyll::RawMarkdown.rel_md_path(url) || url
    end
  end
end

Liquid::Template.register_filter(Jekyll::MdUrlFilter)
