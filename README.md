# RHTE 2019 RHMI Hackathon IoT Data Generator

*NOTE: This repo is archived. It is now hosted [here](https://github.com/evanshortiss/rhte-2019-hackathon-on-rhmi/tree/master/content/iot-data-generator)*

## About

### Data Structures

Generates Meter and Junction payloads that conform to the spec
described [at this link](https://github.com/evanshortiss/rhte-2019-hackathon-on-rhmi/tree/master/data/hackathon-data-structures#iot-sensor-data-inputs-amq-streams).

The parking meter "status" field in payloads are weighted such that the
following states and probabilities are possible for meters:

* ~50% occupied
* ~20% available
* ~20% unknown
* ~10% out-of-service

Similarly, junctions are assigned a weight on initialisation to simulate the
idea that some intersections are busier than others.

### Transports

Data can be written to the following:

* Kafka Topics
* PostgreSQL Tables
* stdout (default)

Configure this by setting a `TRANSPORT_MODE` environment variable.

## Requirements

* Node.js 10+
* Docker 18+

## Configuration

* `TRANSPORT_MODE` - Set to "kafka", "psql", or "console"
* `PG_CONNECTION_STRING` - If `TRANSPORT_MODE` is set to "psql" this will be
used to connect to PostgreSQL. Defaults to "postgresql://rhte-admin:changethistosomethingelse@postgresql.city-of-losangeles.svc:5432/city-info"

## Run Locally with Node.js

Clone locally and run the following from the root of the repository:

```
npm install
npm start
```

## Docker Build & Run

```
export TAGNAME=rhte-2019-rhmi-iot-datagen

docker build . -t $TAGNAME

docker run rhte-2019-rhmi-iot-datagen:latest 
```
