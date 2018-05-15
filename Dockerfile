FROM ruby:2.4.3-slim as webmap

# Install general packages
ENV PACKAGES build-essential libpq-dev netcat git python3 python-pip python-dev apt-utils wget unzip lftp ssh jq netcat
RUN echo "Updating repos..." && apt-get update > /dev/null && \
    echo "Installing packages: ${PACKAGES}..." && apt-get install -y $PACKAGES --fix-missing --no-install-recommends > /dev/null && \
    echo "Done" && rm -rf /var/lib/apt/lists/*

# Install aws-cli
RUN echo "Fetching awscli installer..." && wget -qO "awscli-bundle.zip" "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" && \
    echo "Unpacking..." && unzip awscli-bundle.zip > /dev/null && \
    echo "Installing awscli..." && ./awscli-bundle/install -i /usr/local/aws -b /usr/local/bin/aws > /dev/null && \
    echo "Done" && rm -rf awscli-bundle awscli-bundle.zip

# Configure/Install Postgres Repos/Deps
ENV PG_PACKAGES postgresql-9.6 postgresql-9.6-postgis-2.4
RUN echo deb http://apt.postgresql.org/pub/repos/apt jessie-pgdg main > /etc/apt/sources.list.d/jessie-pgdg.list && \
    wget --quiet -O - http://apt.postgresql.org/pub/repos/apt/ACCC4CF8.asc | apt-key add -
RUN echo "Updating repos..." && apt-get update > /dev/null && \
    echo "Installing posgres packages: ${PG_PACKAGES}..." && apt-get -t jessie-pgdg install -y $PG_PACKAGES --fix-missing --no-install-recommends > /dev/null && \
    echo "Done." && rm -rf /var/lib/apt/lists/*

#Install javascript runtime
RUN wget -q https://deb.nodesource.com/setup_8.x -O nodesource_setup.sh && \
    bash nodesource_setup.sh && \
    apt-get install -qq -y nodejs --fix-missing --no-install-recommends && \
    echo "Done." && rm nodesource_setup.sh && rm -rf /var/lib/apt/lists/*

ENV INSTALL_PATH /app
RUN mkdir -p $INSTALL_PATH
WORKDIR $INSTALL_PATH

RUN mkdir -p tmp/pids

# Cache the bundle install
COPY Gemfile Gemfile
COPY Gemfile.lock Gemfile.lock
RUN bundle install --quiet

COPY . .

ENV RAILS_LOG_TO_STDOUT true

# Precompile assets
ENV RAILS_ENV production
RUN bundle exec rake assets:precompile


# Setup Entrypoint
RUN cp ./docker/entrypoint.sh ./docker/precompile-migrate-run.sh /usr/bin/ && chmod 555 /usr/bin/entrypoint.sh && chmod 555 /usr/bin/precompile-migrate-run.sh
ENTRYPOINT ["entrypoint.sh"]
CMD ["precompile-migrate-run.sh"]

EXPOSE 3000

# Start NGINX container config
FROM nginx as nginx
WORKDIR /public
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY public /public
