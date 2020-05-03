REST-API
=======
An small Node REST Webservice that uses a MongoDB back-end.

Running
-------
I've provided a *Docker Compose* configuration to make it easy to get the app up-and-running quickly. You'll need both `docker` and `docker-compose` installed...

    $ docker build -t rest-api .
    $ docker-compose up -d

This will bring up the application and an instance of *MongoDB* as the database back-end. The database will be pre-populated with some sample data.

The app can be stopped using...

    $ docker-compose down -v

**NOTE: Modifications to the data will not be preserved between restarts**

You can examine the application's logs using...

    $ docker-compose logs rest-api

Running without Docker
----------------------
As long as you have a *MongoDB* instance available locally then you can simply run the app using...

    $ npm run db-up
    $ node .

By default, the app will attempt to connect to a *MongoDB* instance located at `localhost:27017`, to a database named `rest-api`, using no credentials. If this isn't suitable for your environment then there are a number of environment variables allowing control of these settings...

    REST_API_DB_HOST=[MongoDB host] # Defaults to localhost
    REST_API_DB_PORT=[MongoDB host] # Defaults to 27017
    REST_API_DB_NAME=[database name] # Defaults to "rest-api"
    REST_API_DB_USERNAME=[MongoDB username] # If either username or password omitted then no credentials will be used
    REST_API_DB_PASSWORD=[MongoDB password]

You can clean up the data with...

    $ npm run db-down

API
---

| PATH                  | Method    | Responses             | Description
|-------------------    |-----------|---------------        |-----------------
| `/api/products`       | `GET`     | `200`                 | Fetches the list of available product resources. An optional price filter can be specified (see URL parameters, below)
| `/api/products/:id`   | `GET`     | `200`, `404`          | Fetches a single product
| `/api/products`       | `POST`    | `201`, `400`, `401`   | Adds a new product resource
| `/api/products/:id`   | `PUT`     | `200`, `400`, `401`   | Updates an existing product resource
| `/api/products/:id`   | `DELETE`  | `200`, `400`, `401`   | Deletes an existing product resource

### URL Parameters
The `/api/products` resource accepts two optional URL parameters: `priceFrom` and `priceTo`. Either, or both of these can be specified to filter the results by price range. It is the equivalent of `Price >= priceFrom && Price <= priceTo`.

### Invalid Requests
The application will return `400 Bad Request` for any resource (where applicable) that cannot be satisfied given the input. This includes providing an invalid schema when adding or updating a product, modifying a non-existent product, or specifying unsupported URL parameters.

### Product Schema

    {
        _id: String, read-only,
        Name: String,
        Price: Number,
        Category: String,
        Sizes: Array [<String>]
    }

The application will enforce this schema for inserts and updates.
