FROM starefossen/ruby-node:2-10-slim
WORKDIR /usr/working
COPY Gemfile ./
RUN apt-get update && apt-get install -y \
    graphicsmagick \
    imagemagick \
    dh-autoreconf \
    openssl \
    awscli \
    && aws configure set preview.cloudfront true
RUN gem install bundler jekyll
RUN bundle install
EXPOSE 4000
