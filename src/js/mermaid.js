// Separate Mermaid bundle to avoid huge main bundle
import mermaid from 'mermaid'

// Initialize Mermaid with minimal config - CSS handles styling
mermaid.initialize({ 
  startOnLoad: true,
  theme: 'base',
  themeVariables: {
    background: 'transparent'
  }
})

// Export for use
export { mermaid }