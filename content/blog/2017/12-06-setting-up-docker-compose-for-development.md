---
title: Setting up Docker Compose for Development
date: "2017-12-06T22:49:51Z"
description: "General project structure:"
---

General project structure:

```
.
├─ (app code)
├─ containers
|  └─ some.image.name
|     └─ Dockerfile
├─ docker-compose.yml
└─ Dockerfile
```

From here, you can setup how the images should be built and how the containers should be run.

## Sharing files for development

The most important thing for development is that the files to be edited are on the host and then mounted into the image. This way the usual development flow is not interrupted. Here is an example of how this is done:

`./Dockerfile`:

```
COPY . /app
```

`./docker-compose.yml`:

```yaml
app-service:
  volumes:
    - type: bind
      source: .
      target: /app
```

The important thing here is that the source and target match in the Dockerfile as well as the docker-compose.yml. This way you can fully build the image and still have the code available for development.

## Building images specific to project

Another thing I like about docker-compose is reuse images and reference images that are part of your compose setup. For example, you could give an image a name in your `docker-compose.yml`:

```yaml
base:
  image: com.your-app.base
  build: ./containers/com.your-app.base
app-service:
  build: .
  depends_on: base
```

When the images are built Compose will label the images so they can be used in your `Dockerfile`:

```
FROM com.your-app.base
```

This allows you to create generalized configurations that are still local to the project.


---

If you have any suggestions on how this could be improved or found any of this helpful please let me know, thank you!

