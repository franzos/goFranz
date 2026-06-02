const esbuild = require('esbuild')
const { copy } = require('esbuild-plugin-copy')
const { spawn } = require('child_process')
const path = require('path')

const isWatch = process.argv.includes('--watch')

// Build configuration
const buildConfig = {
  entryPoints: {
    'main.min': 'src/js/main.js',
    'mermaid.min': 'src/js/mermaid.js',  
    'mapbox.min': 'src/mapbox.js'
  },
  bundle: true,
  outdir: 'assets/js',
  format: 'iife',
  minify: true,
  sourcemap: false,
  target: ['es2017'],
  banner: {
    js: 'var global = globalThis;'
  },
  outExtension: {
    '.js': '.js'
  },
  assetNames: '../img/[name]-[hash]',
  loader: {
    '.css': 'css',
    '.png': 'file',
    '.gif': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.svg': 'file'
  },
  // Disable code splitting - bundle everything into single files
  splitting: false,
  define: {
    'global': 'globalThis',
  },
  globalName: 'MainApp',
  plugins: []
}

// Assessment tool — built separately so it gets NO global export (no `globalName`),
// keeping it isolated from the main bundle that loads on the same page.
const assessmentConfig = {
  entryPoints: { 'iso-assessment.min': 'src/js/iso-assessment.js' },
  bundle: true,
  outdir: 'assets/js',
  format: 'iife',
  minify: true,
  sourcemap: false,
  target: ['es2017'],
  outExtension: { '.js': '.js' },
  splitting: false,
}

// All SCSS entry:output pairs (main site + standalone software pages)
const sassTargets = [
  'src/scss/main.scss:assets/css/main.min.css',
  'src/scss/software-stackpit.scss:assets/css/software-stackpit.min.css',
  'src/scss/software-forseti.scss:assets/css/software-forseti.min.css',
  'src/scss/software-guix-rs.scss:assets/css/software-guix-rs.min.css',
  'src/scss/software-iced-webview.scss:assets/css/software-iced-webview.min.css',
  'src/scss/iso-assessment.scss:assets/css/iso-assessment.min.css',
  'src/scss/leaflet.scss:assets/css/leaflet.min.css'
]

function startSassWatch() {
  const sassProcess = spawn('sass', [
    ...sassTargets,
    '--style=compressed',
    '--no-source-map',
    '--watch'
  ], {
    stdio: 'inherit'
  })
  
  sassProcess.on('error', (error) => {
    console.error('❌ SASS watch failed:', error.message)
  })
  
  console.log('✅ SASS watching started')
  return sassProcess
}

async function buildSass() {
  return new Promise((resolve, reject) => {
    const sassProcess = spawn('sass', [
      ...sassTargets,
      '--style=compressed',
      '--no-source-map'
    ], {
      stdio: 'inherit'
    })
    
    sassProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ SASS built')
        resolve()
      } else {
        reject(new Error(`SASS build failed with code ${code}`))
      }
    })
  })
}

async function build() {
  try {
    if (isWatch) {
      console.log('👀 Watching for changes...')
      
      // Watch JS files
      const jsContext = await esbuild.context(buildConfig)
      await jsContext.watch()
      const assessmentContext = await esbuild.context(assessmentConfig)
      await assessmentContext.watch()

      // Watch SASS files
      const sassProcess = startSassWatch()

      console.log('✅ JavaScript watching started')
      console.log('🎉 Watching both JS and SASS files')

      // Handle cleanup on exit
      process.on('SIGINT', () => {
        console.log('\n🛑 Stopping watchers...')
        sassProcess.kill()
        jsContext.dispose()
        assessmentContext.dispose()
        process.exit(0)
      })
      
    } else {
      console.log('🔨 Building assets...')
      
      // Build JS
      await esbuild.build(buildConfig)
      console.log('✅ JavaScript built')
      await esbuild.build(assessmentConfig)
      console.log('✅ Assessment JS built')

      // Build SASS
      await buildSass()
      
      console.log('🎉 Build complete!')
    }
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

build()