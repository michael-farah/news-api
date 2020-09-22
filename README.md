# Northcoders News API

## Background

We will be building an API for the purpose of accessing application data programmatically. The intention here is to mimick the building of a real world backend service (such as reddit) which should provide this information to the front end architecture.

Your database will be PSQL, and you will interact with it using [Knex](https://knexjs.org).

You will spend the setup and seeding phase of this project in a pair, and separate once its time to build the server up! The point to separate is clearly annotated :)

## Step 1 - Setting up your project

In this repo we have provided you with the knexfile. Be sure to add it to the `.gitignore` before you start pushing to your repository. If you are on linux insert your postgres username and password into the knexfile.

You have also been provided with a `db` folder with some data, a [setup.sql](./db/setup.sql) file, a `seeds` folder and a `utils` folder. You should also take a minute to familiarise yourself with the npm scripts you have been provided.

Your second task is to make accessing both sets of data around your project easier. You should make 3 `index.js` files: one in `db/data`, and one in each of your data folders (test & development).

The job of `index.js` in each the data folders is to export out all the data from that folder, currently stored in separate files. This is so that, when you need access to the data elsewhere, you can write one convenient require statement - to the index file, rather than having to require each file individually. Think of it like a index of a book - a place to refer to! Make sure the index file exports an object with values of the data from that folder with the keys:

- `topicData`
- `articleData`
- `userData`
- `commentData`

The job of the `db/data/index.js` file will be to export out of the db folder _only the data relevant to the current environment_. Specifically this file should allow your seed file to access only a specific set of data depending on the environment it's in: test, development or production. To do this it will have to require in all the data and should make use of `process.env` in your `index.js` file to achieve only exporting the right data out.

**HINT: make sure the keys you export match up with the keys required into the seed file**

## Step 2 - Migrations and Seeding

Your seed file should now be set up to require in either test or dev data depending on the environment.

You will need to create your migrations and complete the provided seed function to insert the appropriate data into your database.

### Migrations

This is where you will set up the schema for each table in your database.

You should have separate tables for `topics`, `articles`, `users` and `comments`. You will need to think carefully about the order in which you create your migrations. You should think carefully about whether you require any constraints on your table columns (e.g. 'NOT NULL')

Each topic should have:

- `slug` field which is a unique string that acts as the table's primary key
- `description` field which is a string giving a brief description of a given topic

Each user should have:

- `username` which is the primary key & unique
- `avatar_url`
- `name`

Each article should have:

- `article_id` which is the primary key
- `title`
- `body`
- `votes` defaults to 0
- `topic` field which references the slug in the topics table
- `author` field that references a user's primary key (username)
- `created_at` defaults to the current timestamp

Each comment should have:

- `comment_id` which is the primary key
- `author` field that references a user's primary key (username)
- `article_id` field that references an article's primary key
- `votes` defaults to 0
- `created_at` defaults to the current timestamp
- `body`

- **NOTE:** psql expects `Timestamp` types to be in a specific date format - **not a unix timestamp** as they are in our data! However, you can easily **re-format a unix timestamp into something compatible with our database using JS - you will be doing this in your utility functions**... [JavaScript Date object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)

### Seeding

You need to complete the provided seed function to insert the appropriate data into your database.

Utilising your data manipulation skills, you will need to design some utility functions to ensure that the data can fit into your tables. These functions should be extracted into your `utils.js` and built using TDD. If you're feeling stuck, think about how the data looks now and compare it to how it should look for it fit into your table. The katas we gave you on day 1 of this block might be useful.

**Some advice: don't write all the utility functions in one go, write them when you need them in your seed**

---

## Step 3 - Building Endpoints

- Use proper project configuration from the offset, being sure to treat development and test environments differently.
- Test each route **as you go**, checking both successful requests **and the variety of errors you could expect to encounter** [See the error-handling file here for ideas of errors that will need to be considered](error-handling.md).
- After taking the happy path when testing a route, think about how a client could make it go wrong. Add a test for that situation, then error handling to deal with it gracefully.
- **HINT**: You will need to take advantage of knex migrations in order to efficiently test your application.

---

### Vital Routes

Work through building endpoints in the following order:

You will work through the first endpoint in your pair and then diverge for the rest of the sprint.

_details for each endpoint are provided below_

```http
GET /api/topics

>>> Time to go solo! <<<

GET /api/users/:username

DELETE /api/articles/:article_id
PATCH /api/articles/:article_id
GET /api/articles/:article_id

POST /api/articles/:article_id/comments
GET /api/articles/:article_id/comments

GET /api/articles
POST /api/articles

PATCH /api/comments/:comment_id
DELETE /api/comments/:comment_id

GET /api

DELETE /api/articles/:article_id
POST /api/topics
POST /api/users
GET /api/users
```

---

### Route Requirements

_**All of your endpoints should send the below responses in an object, with a key name of what it is that being sent. E.g.**_

```json
{
  "topics": [
    {
      "description": "Code is love, code is life",
      "slug": "coding"
    },
    {
      "description": "FOOTIE!",
      "slug": "football"
    },
    {
      "description": "Hey good looking, what you got cooking?",
      "slug": "cooking"
    }
  ]
}
```

---

```http
GET /api/topics
```

#### Responds with

- an array of topic objects, each of which should have the following properties:
  - `slug`
  - `description`

---

**Please now bid farewell to your pair and continue on this sprint working solo. Ensure that you fork your partner's repo so you don't run into merge conflicts.**


```http
GET /api/users/:username
```

#### Responds with

- a user object which should have the following properties:
  - `username`
  - `avatar_url`
  - `name`

---

```http
GET /api/articles/:article_id
```

#### Responds with

- an article object, which should have the following properties:

  - `author` which is the `username` from the users table
  - `title`
  - `article_id`
  - `body`
  - `topic`
  - `created_at`
  - `votes`
  - `comment_count` which is the total count of all the comments with this article_id - you should make use of knex queries in order to achieve this

---

```http
PATCH /api/articles/:article_id
```

#### Request body accepts

- an object in the form `{ inc_votes: newVote }`

  - `newVote` will indicate how much the `votes` property in the database should be updated by

  e.g.

  `{ inc_votes : 1 }` would increment the current article's vote property by 1

  `{ inc_votes : -100 }` would decrement the current article's vote property by 100

#### Responds with

- the updated article

---

```http
POST /api/articles/:article_id/comments
```

#### Request body accepts

- an object with the following properties:
  - `username`
  - `body`

#### Responds with

- the posted comment

---

```http
GET /api/articles/:article_id/comments
```

#### Responds with

- an array of comments for the given `article_id` of which each comment should have the following properties:
  - `comment_id`
  - `votes`
  - `created_at`
  - `author` which is the `username` from the users table
  - `body`

#### Accepts queries

- `sort_by`, which sorts the comments by any valid column (defaults to created_at)
- `order`, which can be set to `asc` or `desc` for ascending or descending (defaults to descending)

---

```http
GET /api/articles
```

#### Responds with

- an `articles` array of article objects, each of which should have the following properties:
  - `author` which is the `username` from the users table
  - `title`
  - `article_id`
  - `topic`
  - `created_at`
  - `votes`
  - `comment_count` which is the total count of all the comments with this article_id - you should make use of knex queries in order to achieve this

#### Should accept queries

- `sort_by`, which sorts the articles by any valid column (defaults to date)
- `order`, which can be set to `asc` or `desc` for ascending or descending (defaults to descending)
- `author`, which filters the articles by the username value specified in the query
- `topic`, which filters the articles by the topic value specified in the query

---

```http
PATCH /api/comments/:comment_id
```

#### Request body accepts

- an object in the form `{ inc_votes: newVote }`

  - `newVote` will indicate how much the `votes` property in the database should be updated by

  e.g.

  `{ inc_votes : 1 }` would increment the current comment's vote property by 1

  `{ inc_votes : -1 }` would decrement the current comment's vote property by 1

#### Responds with

- the updated comment

---

```http
DELETE /api/comments/:comment_id
```

#### Should

- delete the given comment by `comment_id`

#### Responds with

- status 204 and no content

---

# ADVANCED TASKS

---

```http
GET /api
```

#### Responds with

- JSON describing all the available endpoints on your API

---

#### Hosting

Make sure your application and your database is hosted using Heroku

See the hosting.md file in this repo for more guidance


#### Pagination

To make sure that an API can handle large amounts of data, it is often necessary to use **pagination**. Head over to [Google](https://www.google.co.uk/search?q=cute+puppies), and you will notice that the search results are broken down into pages. It would not be feasible to serve up _all_ the results of a search in one go. The same is true of websites / apps like Facebook or Twitter (except they hide this by making requests for the next page in the background, when we scroll to the bottom of the browser). We can implement this functionality on our `/api/articles` and `/api/comments` endpoints.

```http
GET /api/articles
```

- Should accepts the following queries:
  - `limit`, which limits the number of responses (defaults to 10)
  - `p`, stands for page which specifies the page at which to start (calculated using limit)
- add a `total_count` property, displaying the total number of articles (**this should display the total number of articles with any filters applied, discounting the limit**)

---

```http
GET /api/articles/:article_id/comments
```

Should accept the following queries:

- `limit`, which limits the number of responses (defaults to 10)
- `p`, stands for page which specifies the page at which to start (calculated using limit)

#### More Routes

```http
DELETE /api/articles/:article_id
POST /api/topics
POST /api/users
GET /api/users
```
