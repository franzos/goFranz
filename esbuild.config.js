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
  minify: false,
  keepNames: true,
  sourcemap: false,
  target: ['es2017'],
  banner: {
    js: '// jQuery global setup\nvar global = globalThis;'
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

// SCSS build configuration - use sass CLI instead
const scssConfig = {
  entryPoints: ['src/scss/main.scss'],
  bundle: true,
  outdir: 'assets/css',
  minify: true,
  sourcemap: false,
  loader: {
    '.scss': 'css',
    '.css': 'css',
    '.png': 'file',
    '.gif': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.svg': 'file'
  },
  outExtension: {
    '.css': '.min.css'
  }
}

function startSassWatch() {
  const sassProcess = spawn('sass', [
    'src/scss/main.scss:assets/css/main.min.css',
    '--style=compressed',
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
      'src/scss/main.scss:assets/css/main.min.css',
      '--style=compressed'
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
      
      // Watch SASS files
      const sassProcess = startSassWatch()
      
      console.log('✅ JavaScript watching started')
      console.log('🎉 Watching both JS and SASS files')
      
      // Handle cleanup on exit
      process.on('SIGINT', () => {
        console.log('\n🛑 Stopping watchers...')
        sassProcess.kill()
        jsContext.dispose()
        process.exit(0)
      })
      
    } else {
      console.log('🔨 Building assets...')
      
      // Build JS
      await esbuild.build(buildConfig)
      console.log('✅ JavaScript built')
      
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