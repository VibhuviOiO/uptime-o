# uptimeO

This application was generated using JHipster 8.11.0, you can find documentation and help at [https://www.jhipster.tech/documentation-archive/v8.11.0](https://www.jhipster.tech/documentation-archive/v8.11.0).

## Project Structure

Node is required for generation and recommended for development. `package.json` is always generated for a better development experience with prettier, commit hooks, scripts and so on.

In the project root, JHipster generates configuration files for tools like git, prettier, eslint, husky, and others that are well known and you can find references in the web.

`/src/*` structure follows default Java structure.

- `.yo-rc.json` - Yeoman configuration file
  JHipster configuration is stored in this file at `generator-jhipster` key. You may find `generator-jhipster-*` for specific blueprints configuration.
- `.yo-resolve` (optional) - Yeoman conflict resolver
  Allows to use a specific action when conflicts are found skipping prompts for files that matches a pattern. Each line should match `[pattern] [action]` with pattern been a [Minimatch](https://github.com/isaacs/minimatch#minimatch) pattern and action been one of skip (default if omitted) or force. Lines starting with `#` are considered comments and are ignored.
- `.jhipster/*.json` - JHipster entity configuration files

- `npmw` - wrapper to use locally installed npm.
  JHipster installs Node and npm locally using the build tool by default. This wrapper makes sure npm is installed locally and uses it avoiding some differences different versions can cause. By using `./npmw` instead of the traditional `npm` you can configure a Node-less environment to develop or test your application.
- `/src/main/docker` - Docker configurations for the application and services that the application depends on

## Default Users

The application comes with pre-configured users for testing different roles:

| Username | Password | Role | Homepage |
|----------|----------|------|----------|
| `admin` | `admin` | ROLE_ADMIN | Admin Infrastructure Dashboard |
| `user` | `user` | ROLE_USER | Public Status Page |
| `support` | `admin` | ROLE_SUPPORT | Support Dashboard |
| `infra` | `admin` | ROLE_INFRA_TEAM | Infrastructure Dashboard |

**Note:** Change these default passwords in production environments.

### Role-Based Homepage

The application displays different homepages based on user roles:
- **Not logged in**: Public Status Page (8 HTTP monitors)
- **ROLE_ADMIN**: Admin Infrastructure Dashboard (3 Services with dependencies)
- **ROLE_SUPPORT**: Support Dashboard (4 HTTP monitors)
- **ROLE_INFRA_TEAM**: Infrastructure Dashboard (3 Services)
- **ROLE_USER**: Public Status Page

## Development

### Doing API-First development using openapi-generator-cli

[OpenAPI-Generator]() is configured for this application. You can generate API code from the `src/main/resources/swagger/api.yml` definition file by running:

```bash
./mvnw generate-sources
```

Then implements the generated delegate classes with `@Service` classes.

To edit the `api.yml` definition file, you can use a tool such as [Swagger-Editor](). Start a local instance of the swagger-editor using docker by running: `docker compose -f src/main/docker/swagger-editor.yml up -d`. The editor will then be reachable at [http://localhost:7742](http://localhost:7742).

Refer to [Doing API-First development][] for more details.
The build system will install automatically the recommended version of Node and npm.

We provide a wrapper to launch npm.
You will only need to run this command when dependencies change in [package.json](package.json).

```
./npmw install
```

We use npm scripts and [Webpack][] as our build system.

Run the following commands in two separate terminals to create a blissful development experience where your browser
auto-refreshes when files change on your hard drive.

```
./mvnw
./npmw start
```

Npm is also used to manage CSS and JavaScript dependencies used in this application. You can upgrade dependencies by
specifying a newer version in [package.json](package.json). You can also run `./npmw update` and `./npmw install` to manage dependencies.
Add the `help` flag on any command to see how you can use it. For example, `./npmw help update`.

The `./npmw run` command will list all the scripts available to run for this project.

### Running Monitoring Agents

To receive monitoring heartbeats, run 2 agents (seeded data includes Agent ID 1 and 2):

```bash
# Agent 1 (US-East-Agent, Virginia datacenter)
docker run -d \
  --name agent-va \
  --network host \
  -e AGENT_ID="1" \
  -e API_BASE_URL="http://localhost:8080" \
  -e API_KEY="your_api_key_here" \
  -v "$(pwd)/tmp/data/agent-va:/data" \
  ghcr.io/vibhuvioio/uptimeo-agent:latest

# Agent 2 (US-West-Agent, San Francisco datacenter)
docker run -d \
  --name agent-sf \
  --network host \
  -e AGENT_ID="2" \
  -e API_BASE_URL="http://localhost:8080" \
  -e API_KEY="your_api_key_here" \
  -v "$(pwd)/tmp/data/agent-sf:/data" \
  ghcr.io/vibhuvioio/uptimeo-agent:latest
```

Both agents will monitor all 8 seeded HTTP monitors every 60 seconds.

### PWA Support

JHipster ships with PWA (Progressive Web App) support, and it's turned off by default. One of the main components of a PWA is a service worker.

The service worker initialization code is commented out by default. To enable it, uncomment the following code in `src/main/webapp/index.html`:

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').then(function () {
      console.log('Service Worker Registered');
    });
  }
</script>
```

Note: [Workbox](https://developers.google.com/web/tools/workbox/) powers JHipster's service worker. It dynamically generates the `service-worker.js` file.

### Managing dependencies

For example, to add [Leaflet][] library as a runtime dependency of your application, you would run following command:

```
./npmw install --save --save-exact leaflet
```

To benefit from TypeScript type definitions from [DefinitelyTyped][] repository in development, you would run following command:

```
./npmw install --save-dev --save-exact @types/leaflet
```

Then you would import the JS and CSS files specified in library's installation instructions so that [Webpack][] knows about them:
Note: There are still a few other things remaining to do for Leaflet that we won't detail here.

For further instructions on how to develop with JHipster, have a look at [Using JHipster in development][].

## Building for production

### Packaging as jar

To build the final jar and optimize the uptimeO application for production, run:

```
./mvnw -Pprod clean verify
```

This will concatenate and minify the client CSS and JavaScript files. It will also modify `index.html` so it references these new files.
To ensure everything worked, run:

```
java -jar target/*.jar
```

Then navigate to [http://localhost:8080](http://localhost:8080) in your browser.

Refer to [Using JHipster in production][] for more details.

### Packaging as war

To package your application as a war in order to deploy it to an application server, run:

```
./mvnw -Pprod,war clean verify
```

### JHipster Control Center

JHipster Control Center can help you manage and control your application(s). You can start a local control center server (accessible on http://localhost:7419) with:

```
docker compose -f src/main/docker/jhipster-control-center.yml up
```

## Testing

### Spring Boot tests

To launch your application's tests, run:

```
./mvnw verify
```

### Client tests

Unit tests are run by [Jest][]. They're located near components and can be run with:

```
./npmw test
```

## Others

### Code quality using Sonar

Sonar is used to analyse code quality. You can start a local Sonar server (accessible on http://localhost:9001) with:

```
docker compose -f src/main/docker/sonar.yml up -d
```

Note: we have turned off forced authentication redirect for UI in [src/main/docker/sonar.yml](src/main/docker/sonar.yml) for out of the box experience while trying out SonarQube, for real use cases turn it back on.

You can run a Sonar analysis with using the [sonar-scanner](https://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner) or by using the maven plugin.

Then, run a Sonar analysis:

```
./mvnw -Pprod clean verify sonar:sonar -Dsonar.login=admin -Dsonar.password=admin
```

If you need to re-run the Sonar phase, please be sure to specify at least the `initialize` phase since Sonar properties are loaded from the sonar-project.properties file.

```
./mvnw initialize sonar:sonar -Dsonar.login=admin -Dsonar.password=admin
```

Additionally, Instead of passing `sonar.password` and `sonar.login` as CLI arguments, these parameters can be configured from [sonar-project.properties](sonar-project.properties) as shown below:

```
sonar.login=admin
sonar.password=admin
```

For more information, refer to the [Code quality page][].

### Docker Compose support

JHipster generates a number of Docker Compose configuration files in the [src/main/docker/](src/main/docker/) folder to launch required third party services.

For example, to start required services in Docker containers, run:

```
docker compose -f src/main/docker/services.yml up -d
```

To stop and remove the containers, run:

```
docker compose -f src/main/docker/services.yml down
```

[Spring Docker Compose Integration](https://docs.spring.io/spring-boot/reference/features/dev-services.html) is enabled by default. It's possible to disable it in application.yml:

```yaml
spring:
  ...
  docker:
    compose:
      enabled: false
```

You can also fully dockerize your application and all the services that it depends on.
To achieve this, first build a Docker image of your app by running:

```sh
npm run java:docker
```

Or build a arm64 Docker image when using an arm64 processor os like MacOS with M1 processor family running:

```sh
npm run java:docker:arm64
```

Then run:

```sh
docker compose -f src/main/docker/app.yml up -d
```

## Create the the partition. : 

CREATE TABLE IF NOT EXISTS api_heartbeats_2025_11_10
PARTITION OF api_heartbeats
FOR VALUES FROM ('2025-11-10 00:00:00') TO ('2025-11-11 00:00:00');


docker run -d \
  --name agent-va \
  --network host \
  -e AGENT_ID="1151" \
  -e API_BASE_URL="http://host.docker.internal:8080" \
  -e QUEUE_PATH="/data/queue" \
  -e CONFIG_RELOAD_INTERVAL="1m" \
  -e API_KEY="uptimeo_WRoiXfzcc8XIyEnIHh4dpbtL6susRo00W4JfsmDUMEc" \
  -v "$(pwd)/tmp/data/agent-va:/data" \
  --restart unless-stopped \
  ghcr.io/vibhuvioio/uptimeo-agent:latest

docker run -d \
  --name agent-sf \
  --network host \
  -e AGENT_ID="1651" \
  -e API_BASE_URL="http://host.docker.internal:8080" \
  -e QUEUE_PATH="/data/queue" \
  -e CONFIG_RELOAD_INTERVAL="1m" \
  -e API_KEY="uptimeo_WRoiXfzcc8XIyEnIHh4dpbtL6susRo00W4JfsmDUMEc" \
  -v "$(pwd)/tmp/data/agent-sf:/data" \
  --restart unless-stopped \
  -p 8084:9090 \
  ghcr.io/vibhuvioio/uptimeo-agent:latest