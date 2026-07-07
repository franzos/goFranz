require 'uri'

module Jekyll
  # Adds rel="noopener" to external links at build time (reverse-tabnabbing
  # hygiene). Runs on the final rendered HTML so it covers markdown bodies, raw
  # HTML pages and links from layouts/includes alike. Deliberately no
  # "noreferrer": we keep the Referer so sites we link to can still attribute
  # the traffic to gofranz.com. Outbound-click tracking stays in analytics.html
  # (it is inherently runtime).
  module ExternalLinks
    module_function

    A_TAG   = /<a\b[^>]*>/i
    HREF    = /\bhref\s*=\s*(["'])(.*?)\1/i
    REL     = /\brel\s*=\s*(["'])(.*?)\1/i

    def site_host(site)
      URI.parse(site.config['url'].to_s).host
    rescue URI::InvalidURIError
      nil
    end

    def internal?(host, base)
      return true if host.nil? || base.nil?
      host == base || host.end_with?(".#{base}")
    end

    def process(html, base)
      return html if html.nil?
      html.gsub(A_TAG) do |tag|
        href = tag[HREF, 2]
        next tag unless href && href =~ %r{\Ahttps?://}i
        host = (URI.parse(href).host rescue nil)
        next tag if internal?(host, base)

        if (m = tag.match(REL))
          rels = m[2].split(/\s+/)
          next tag if rels.include?('noopener')
          tag.sub(REL, %(rel="#{(rels + ['noopener']).join(' ')}"))
        else
          tag.sub(/<a\b/i, '<a rel="noopener"')
        end
      end
    end
  end

  Hooks.register :pages, :post_render do |page|
    page.output = ExternalLinks.process(page.output, ExternalLinks.site_host(page.site))
  end

  Hooks.register :documents, :post_render do |doc|
    doc.output = ExternalLinks.process(doc.output, ExternalLinks.site_host(doc.site))
  end
end
