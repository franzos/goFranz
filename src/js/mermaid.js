// Separate Mermaid bundle to avoid huge main bundle
import mermaid from 'mermaid'

// Color mappings for different themes
const colorMappings = {
  light: {
    '#e1f5fe': '#e1f5fe', // identity - light blue
    '#e8f5e8': '#e8f5e8', // kyc - light green
    '#fff3e0': '#fff3e0', // external - light orange
    '#f3e5f5': '#f3e5f5'  // monitoring - light purple
  },
  dark: {
    '#e1f5fe': '#1e3a8a', // identity - dark blue
    '#e8f5e8': '#166534', // kyc - dark green
    '#fff3e0': '#92400e', // external - dark orange
    '#f3e5f5': '#581c87'  // monitoring - dark purple
  }
}

// Function to get current theme
function getCurrentTheme() {
  const currentTheme = document.documentElement.getAttribute('data-bs-theme')
  return currentTheme === 'dark' ? 'dark' : 'light'
}


// Function to get enhanced theme variables
function getThemeVariables(theme) {
  const isDark = theme === 'dark'
  
  return {
    background: 'transparent',
    // Text colors
    primaryTextColor: isDark ? '#ffffff' : '#000000',
    secondaryColor: isDark ? '#374151' : '#f3f4f6',
    tertiaryColor: isDark ? '#4b5563' : '#e5e7eb',
    
    // Edge/line colors - crucial for visibility
    lineColor: isDark ? '#9ca3af' : '#374151',
    edgeLabelBackground: isDark ? '#374151' : '#ffffff',
    
    // Subgraph styling
    clusterBkg: isDark ? '#374151' : '#f9fafb',
    clusterBorder: isDark ? '#6b7280' : '#d1d5db',
    
    // Node border colors
    primaryBorderColor: isDark ? '#6b7280' : '#d1d5db',
    secondaryBorderColor: isDark ? '#4b5563' : '#9ca3af',
    
    // Additional contrast improvements
    mainBkg: 'transparent',
    nodeBorder: isDark ? '#6b7280' : '#374151'
  }
}

// Function to reinitialize Mermaid with proper theme
function initializeMermaidWithTheme() {
  const theme = getCurrentTheme()
  const themeVariables = getThemeVariables(theme)
  
  mermaid.initialize({ 
    startOnLoad: false,
    theme: 'base',
    themeVariables: themeVariables
  })
}

// Enhanced function to update colors and reinitialize
function updateMermaidColors() {
  const theme = getCurrentTheme()
  const mapping = colorMappings[theme]
  
  // First, reinitialize Mermaid with proper theme variables
  initializeMermaidWithTheme()
  
  document.querySelectorAll('.mermaid').forEach(element => {
    // Store original content on first run
    if (!element.dataset.originalContent) {
      element.dataset.originalContent = element.textContent
    }
    
    const originalContent = element.dataset.originalContent
    let updatedContent = originalContent
    
    // Replace colors based on current theme
    Object.entries(mapping).forEach(([lightColor, themeColor]) => {
      const regex = new RegExp(`fill:${lightColor.replace('#', '#')}`, 'g')
      updatedContent = updatedContent.replace(regex, `fill:${themeColor}`)
    })
    
    // Only update if content changed
    if (element.textContent !== updatedContent) {
      element.textContent = updatedContent
      
      // Remove processed flag to allow re-rendering
      element.removeAttribute('data-processed')
      element.classList.remove('mermaid-svg')
      
      // Remove existing SVG
      const existingSvg = element.querySelector('svg')
      if (existingSvg) {
        existingSvg.remove()
      }
    }
  })
  
  // Re-initialize Mermaid for updated elements
  mermaid.init(undefined, document.querySelectorAll('.mermaid:not([data-processed])'))
}

// Initial setup
initializeMermaidWithTheme()

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  updateMermaidColors()
})

// Listen for theme changes
document.addEventListener('themeChanged', () => {
  updateMermaidColors()
})

// Export for use
export { mermaid, updateMermaidColors }