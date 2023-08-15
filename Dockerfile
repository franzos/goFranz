FROM ruby:3.2-slim-bullseye
WORKDIR /usr/working
COPY Gemfile ./
RUN apt-get update && apt-get install -y \
    graphicsmagick \
    imagemagick \
    dh-autoreconf \
    openssl \
    awscli \
    zlib1g \
    nodejs npm \
    && aws configure set preview.cloudfront true
RUN bundle install
EXPOSE 4000
