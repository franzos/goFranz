require 'kramdown'

module Jekyll
  module PlainMarkdownFilter
    def plain_markdown(input)
      options = {
        input: 'GFM',
        syntax_highlighter: nil,
        syntax_highlighter_opts: {}
      }
      
      Kramdown::Document.new(input, options).to_html
    end
  end
  
  Jekyll::Hooks.register :documents, :pre_render do |doc|
    doc.data['raw_content'] = doc.content
  end
end

Liquid::Template.register_filter(Jekyll::PlainMarkdownFilter)
