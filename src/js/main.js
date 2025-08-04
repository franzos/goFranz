// Import jQuery FIRST and expose globally immediately
import jQuery from 'jquery'

// Set up global jQuery access
globalThis.jQuery = jQuery
globalThis.$ = jQuery
window.jQuery = jQuery
window.$ = jQuery

// Import Bootstrap JS components (only what you need)
import 'bootstrap/js/dist/collapse'
import 'bootstrap/js/dist/dropdown'
import 'bootstrap/js/dist/modal'
import 'bootstrap/js/dist/offcanvas'


// Import exlink
import 'exlink/jquery.exLink.js'

// Import highlight.js
import hljs from 'highlight.js'

// Mermaid will be loaded separately due to its size

// Initialize highlight.js
document.addEventListener('DOMContentLoaded', () => {
  hljs.highlightAll()
  
  // Initialize image modal functionality
  initImageModal()
  
  // Initialize theme switching
  initThemeSwitch()
})

// Image modal functionality
function initImageModal() {
  const imageModal = document.getElementById('imageModal')
  if (!imageModal) return
  
  imageModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget
    const imageSrc = button.getAttribute('data-image')
    const imageCaption = button.getAttribute('data-caption')
    
    const modalImage = document.getElementById('modalImage')
    
    if (modalImage && imageSrc) {
      modalImage.src = imageSrc
      modalImage.alt = imageCaption || 'Project image'
    }
  })
}


// Initialize exLink when available
$(window).on('load', function () {
  if (typeof window.exLink !== 'undefined') {
    window.exLink.init({
      protocols: ["http", "https"],
      filetypes: ["pdf", "xls", "docx", "doc", "ppt", "pptx"],
      noFollow: true,
      linkWarning: false,
      gaTrackLabel: "External Links",
    });
  }
})

// Your existing custom JavaScript can go here
// For example, if you had custom slideout initialization:
/*
const slideout = new Slideout({
  'panel': document.getElementById('panel'),
  'menu': document.getElementById('menu'),
  'padding': 256,
  'tolerance': 70
})
*/

// Make available globally for legacy scripts
window.hljs = hljs

// Theme switching functionality
function getStoredTheme() {
  return localStorage.getItem('theme')
}

function setStoredTheme(theme) {
  localStorage.setItem('theme', theme)
}

function getPreferredTheme() {
  const storedTheme = getStoredTheme()
  if (storedTheme) {
    return storedTheme
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function setTheme(theme) {
  if (theme === 'auto') {
    document.documentElement.setAttribute('data-bs-theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  } else {
    document.documentElement.setAttribute('data-bs-theme', theme)
  }
  
  // Emit theme change event for dynamic components
  document.dispatchEvent(new CustomEvent('themeChanged', { 
    detail: { theme: document.documentElement.getAttribute('data-bs-theme') }
  }))
}

function showActiveTheme(theme, focus = false) {
  const themeSwitchers = document.querySelectorAll('.theme-toggle')
  
  if (!themeSwitchers.length) return

  const activeThemeIcon = document.querySelector('.theme-icon-active .theme-icon')
  const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`)
  
  document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
    element.classList.remove('active')
    element.setAttribute('aria-pressed', 'false')
  })

  if (btnToActive) {
    btnToActive.classList.add('active')
    btnToActive.setAttribute('aria-pressed', 'true')
  }

  const themeSwitchText = document.querySelector('#bd-theme-text')
  if (themeSwitchText) {
    const activeThemeText = document.querySelector(`[data-bs-theme-value="${theme}"] .d-none`)?.textContent?.replace(/\s+/g, ' ').trim() || theme
    themeSwitchText.textContent = activeThemeText
  }

  if (focus) {
    themeSwitchers.forEach(switcher => switcher.focus())
  }
}

function initThemeSwitch() {
  // Set theme on load
  setTheme(getPreferredTheme())

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const storedTheme = getStoredTheme()
    if (storedTheme !== 'light' && storedTheme !== 'dark') {
      setTheme(getPreferredTheme())
    }
  })

  // Simple theme toggle (cycles through: light -> dark -> auto)
  document.querySelectorAll('.theme-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-bs-theme')
      let newTheme
      
      if (currentTheme === 'light') {
        newTheme = 'dark'
      } else if (currentTheme === 'dark') {
        newTheme = 'light'
      } else {
        // auto or unset, determine based on current system preference
        newTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark'
      }
      
      setStoredTheme(newTheme)
      setTheme(newTheme)
      showActiveTheme(newTheme, true)
    })
  })

  // Show active theme on load
  showActiveTheme(getPreferredTheme())
}