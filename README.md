# Node Skeleton Microservice


This repository is the node skeleton microservice to create node microservice for WRI API

1. [Getting Started](#getting-started)

## Getting Started

### OS X + Docker

**First, make sure that you have the [API gateway running
locally](https://github.com/control-tower/control-tower).**

We're using Docker which, luckily for you, means that getting the
application running locally should be fairly painless. First, make sure
that you have [Docker Compose](https://docs.docker.com/compose/install/)
installed on your machine.

```
git clone https://github.com/Vizzuality/node-skeleton
cd node-skeleton
./service.sh develop
./service.sh test
```text

You can now access the microservice through the CT gateway.

```

### Native execution

Start by installing the node dependencies using:
```
npm install
```

You need to ensure the configuration below is present before starting the application server. You can do so using a 
``` .env ``` file based on the provided ```.env.sample``` file. Refer to the configuration instructions below for more info.

Once the configuration variables are set you can start the application server:
```
npm start
```

### Configuration

It is necessary to define these environment variables:

* CT_URL => Control Tower URL. Leave empty for native execution
* NODE_ENV => Environment (prod, staging, dev)
* PORT => Port on which to execute the server. Leave empty for execution with Control Tower.
