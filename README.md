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

| PATH                  | Method    | Responses                 | Description
|-------------------    |-----------|---------------            |-----------------
| `/api/products`       | `GET`     | `200`                     | Fetches the list of available product resources. An optional price filter can be specified (see URL parameters, below)
| `/api/products/:id`   | `GET`     | `200`, `404`              | Fetches a single product
| `/api/products`       | `POST`    | `201`, `400`, `401`       | Adds a new product resource. Requires a valid authentication token.
| `/api/products/:id`   | `PUT`     | `200`, `400`, `401`, `404`| Updates an existing product resource. Requires a valid authentication token.
| `/api/products/:id`   | `DELETE`  | `200`, `400`, `401`, `404`| Deletes an existing product resource. Requires a valid authentication token.

### URL Parameters
The `/api/products` resource accepts two optional URL parameters: `priceFrom` and `priceTo`. Either, or both of these can be specified to filter the results by price range. It is the equivalent of `Price >= priceFrom && Price <= priceTo`.

### Invalid Requests
The application will return `400 Bad Request` for any resource (where applicable) that cannot be satisfied given the input. This includes providing an invalid schema when adding or updating a product, or specifying unsupported URL parameters.

### Operations on non-existent resources
Fetching, modifying, or deleting a product with a non-existent or invalid `:id` value will result in a `404 Not Found` response.

### Internal errors
If the application encounters an error with its database client connection during adding, updating, or deleting a product, then it will respond with a `503 Service Unavailable` response.

### Product Schema

    {
        _id: String, read-only,
        Name: String,
        Price: Number,
        Category: String,
        Sizes: Array [<String>]
    }

The application will enforce this schema for inserts and updates.

Authentication
--------------
Adding, updating, and deleting products requires that the request contain a valid token in the `X-Token` header. The test data provided contains a single token value of `SECRET_KEY`, which can be used for testing.
