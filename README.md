# Northcoders News API

## Background

We will be building an API for the purpose of accessing application data programmatically. The intention here is to mimic the building of a real world backend service (such as reddit) which should provide this information to the front end architecture.

Your database will be PSQL, and you will interact with it using [node-postgres](https://node-postgres.com/).


## Step 1 - Setting up your project

You will need to create _two_ `.env` files for your project: `.env.test` and `.env.development`. Into each, add `PGDATABASE=<database_name_here>`, with the correct database name for that environment (see `/db/setup.sql` for the database names). Double check that these `.env` files are .gitignored.

You have also been provided with a `db` folder with some data, a [setup.sql](./db/setup.sql) file and a `seeds` folder. You should also take a minute to familiarise yourself with the npm scripts you have been provided.

The job of `index.js` in each the data folders is to export out all the data from that folder, currently stored in separate files. This is so that, when you need access to the data elsewhere, you can write one convenient require statement - to the index file, rather than having to require each file individually. Think of it like a index of a book - a place to refer to! Make sure the index file exports an object with values of the data from that folder with the keys:

- `topicData`
- `articleData`
- `userData`
- `commentData`

## Step 2 - Creating tables and Seeding

You will need to create your tables and write your seed function to insert the data into your database.

In order to both create the tables and seed your data, you will need the connection to your database. You can find this in the provided `connection.js`.

### Creating Tables

You should have separate tables for `topics`, `articles`, `users` and `comments`. Make sure to consider the order in which you create your tables. You should think about whether you require any constraints on your table columns (e.g. 'NOT NULL')

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

### Seeding

You need to complete the provided seed function to insert the appropriate data into your database.

---

## Step 3 - Building Endpoints

- Use proper project configuration from the offset, being sure to treat development and test environments differently.
- Test each route **as you go**, checking both successful requests **and the variety of errors you could expect to encounter** [See the error-handling file here for ideas of errors that will need to be considered](error-handling.md).
- After taking the happy path when testing a route, think about how a client could make it go wrong. Add a test for that situation, then error handling to deal with it gracefully.

---

Work through building endpoints in the following order:

_This is a summary of all the endpoints. More detail about each endpoint is further down this document._

**Essential endpoints**

```http
GET /api/topics
GET /api/articles/:article_id
PATCH /api/articles/:article_id
GET /api/articles
GET /api/articles/:article_id/comments
POST /api/articles/:article_id/comments
DELETE /api/comments/:comment_id
GET /api
```

> Hosting and README time!

**Next endpoints to work through**

```http
GET /api/users
GET /api/users/:username
PATCH /api/comments/:comment_id
```

---

All of your endpoints should send the responses specified below in an **object**, with a **key name** of what it is that being sent. E.g.

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

### Essential Routes

#### **GET /api/topics**

Responds with:

- an array of topic objects, each of which should have the following properties:
  - `slug`
  - `description`

---

#### **GET /api/articles/:article_id**

Responds with:

- an article object, which should have the following properties:

  - `author` which is the `username` from the users table
  - `title`
  - `article_id`
  - `body`
  - `topic`
  - `created_at`
  - `votes`
  - `comment_count` which is the total count of all the comments with this article_id - you should make use of queries to the database in order to achieve this

---

#### **PATCH /api/articles/:article_id**

Request body accepts:

- an object in the form `{ inc_votes: newVote }`

  - `newVote` will indicate how much the `votes` property in the database should be updated by

  e.g.

  `{ inc_votes : 1 }` would increment the current article's vote property by 1

  `{ inc_votes : -100 }` would decrement the current article's vote property by 100

Responds with:

- the updated article

---

#### **GET /api/articles**

Responds with:

- an `articles` array of article objects, each of which should have the following properties:
  - `author` which is the `username` from the users table
  - `title`
  - `article_id`
  - `topic`
  - `created_at`
  - `votes`
  - `comment_count` which is the total count of all the comments with this article_id - you should make use of queries to the database in order to achieve this

Should accept queries:

- `sort_by`, which sorts the articles by any valid column (defaults to date)
- `order`, which can be set to `asc` or `desc` for ascending or descending (defaults to descending)
- `topic`, which filters the articles by the topic value specified in the query

---

#### **GET /api/articles/:article_id/comments**

Responds with:

- an array of comments for the given `article_id` of which each comment should have the following properties:
  - `comment_id`
  - `votes`
  - `created_at`
  - `author` which is the `username` from the users table
  - `body`

---

#### **POST /api/articles/:article_id/comments**

Request body accepts:

- an object with the following properties:
  - `username`
  - `body`

Responds with:

- the posted comment

---

#### **DELETE /api/comments/:comment_id**

Should:

- delete the given comment by `comment_id`

Responds with:

- status 204 and no content

---

#### **GET /api**

Responds with:

- JSON describing all the available endpoints on your API, see the [endpoints.json](./endpoints.json) for an (incomplete) example that you could build on, or create your own from scratch!

---

### **STOP POINT: Hosting and README!**

- If you _have_ already hosted your app at this point, remember to push up to `heroku` your updated code
- If you haven't already hosted your app, now is the time! Follow the instructions in [hosting.md](./hosting.md)
- Write your README, including the following information:
  - [ ] Link to hosted version
  - [ ] Write a summary of what the project is
  - [ ] Provide clear instructions of how to clone, install dependencies, seed local database, and run tests
  - [ ] Include information about how to create the two `.env` files
  - [ ] Specify minimum versions of `Node.js` and `Postgres` needed to run the project

**Remember that this README is targetted at people who will come to your repo (potentially from your CV or portfolio website) and want to see what you have created, and try it out for themselves(not _just_ to look at your code!). So it is really important to include a link to the hosted version, as well as implement the above `GET /api` endpoint so that it is clear what your api does.**

---

### Further Routes

#### **GET /api/users**

Responds with:

- an array of objects, each object should have the following property:
  - `username`

---

#### **GET /api/users/:username**

Responds with:

- a user object which should have the following properties:
  - `username`
  - `avatar_url`
  - `name`

---

#### **PATCH /api/comments/:comment_id**

Request body accepts:

- an object in the form `{ inc_votes: newVote }`

  - `newVote` will indicate how much the `votes` property in the database should be updated by

  e.g.

  `{ inc_votes : 1 }` would increment the current comment's vote property by 1

  `{ inc_votes : -1 }` would decrement the current comment's vote property by 1

Responds with:

- the updated comment

---

### _Even more_ endpoints/tasks

#### Adding pagination to GET /api/articles - adding pagination

> To make sure that an API can handle large amounts of data, it is often necessary to use **pagination**. Head over to [Google](https://www.google.co.uk/search?q=cute+puppies), and you will notice that the search results are broken down into pages. It would not be feasible to serve up _all_ the results of a search in one go. The same is true of websites / apps like Facebook or Twitter (except they hide this by making requests for the next page in the background, when we scroll to the bottom of the browser). We can implement this functionality on our `/api/articles` and `/api/comments` endpoints.

- Should accepts the following queries:
  - `limit`, which limits the number of responses (defaults to 10)
  - `p`, stands for page which specifies the page at which to start (calculated using limit)
- add a `total_count` property, displaying the total number of articles (**this should display the total number of articles with any filters applied, discounting the limit**)

---

#### Adding pagination to GET /api/articles/:article_id/comments

Should accept the following queries:

- `limit`, which limits the number of responses (defaults to 10)
- `p`, stands for page which specifies the page at which to start (calculated using limit)

---

#### POST /api/articles

Request body accepts:

- an object with the following properties:

  - `author` which is the `username` from the users table
  - `title`
  - `body`
  - `topic`

Responds with:

- the newly added article, with all the above properties as well as:
  - `article_id`
  - `votes`
  - `created_at`
  - `comment_count`

#### POST /api/topics

Request body accepts:

- an object in the form:

```json
{
  "slug": "topic name here",
  "description": "description here"
}
```

Responds with:

- a topic object containing the newly added topic

#### DELETE /api/articles/:article_id

Should:

- delete the given article by article_id

Respond with:

- status 204 and no content
