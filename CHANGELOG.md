## 20/09/2021

- Modify S3 widget thumbnail urls to use HTTPS

## 09/09/2021

- Pass along query parameters to rendering URL when generating widget thumbnails.

## 07/09/2021

- Add missing chromium deps to dockerfile.
- Update dev dependencies
- Update `rw-api-microservice-node` to remove CT support.
- Remove unnecessary `jsonapi-serializer` dependency.

## 31/05/2021

- Update `rw-api-microservice-node` to add CORS support.

## 10/03/2021

- Update dockerfile setup with less dependencies and add pupeteer required lib

## 14/01/2021

- Replace CT integration library

# v1.1.1

## 08/04/2020

- Update k8s configuration with node affinity.

# v1.1.0

## 28/02/2020

- Remove quality option for screenshot because it is not compatible with png format
- Use networkidle2 for checking when the URL has been loaded
- Improve quality of screenshot using quality parameter
- Remove format from screenshot because it can only be applied to pdf
- Update version of puppeteer giving that the specified on package is not working
- Add format query parameter to screenshot endpoint to allow pdf and png screenshots.

# v1.0.0

## 14/01/2020

- Maintenance tasks and update service dependencies to more recent versions.

# Previous

- Update node version to 12.
- Replace npm with yarn.
- Add readiness and liveliness checks to k8s config.
- Add resource quota definition for kubernetes.
