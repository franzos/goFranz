# GoFranz

Asset compilation:

```bash
guix shell node pnpm imagemagick graphicsmagick -- pnpm dlx gulp
```


Preview

```bash
guix shell ruby make gcc-toolchain
BUNDLE_PATH=.bundle bundle install
BUNDLE_PATH=.bundle bundle exec jekyll serve
```

Quick-preview:

```bash
guix shell ruby@3.1 make gcc-toolchain -- sh -c "export BUNDLE_PATH=.bundle && bundle install && bundle exec jekyll serve"
```

Build

```bash
BUNDLE_PATH=.bundle bundle exec jekyll build
```
