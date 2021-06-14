# Hosting a PSQL DB using Heroku

**\*\* This file is only relevant for an advanced task. You can ignore this until then! \*\***

Before you do this, please make your own public repo so that you can share this project as part of your portfolio by doing the following:

1. Create a new _public_ GitHub repository, and do **not** initialise the project with a readme, .gitignore or license.
2. From your _local_ copy of your repository, push your code to your new respository using the following commands:

```bash
git remote set-url origin YOUR_NEW_REPO_URL_HERE
git branch -M main
git push -u origin main
```

There are many ways to host applications like the one you have created. One of these solutions is Heroku. Heroku provides a service that you can push your code to and it will build, run and host it. Heroku also allows for easy database integration. Their [documentation](https://devcenter.heroku.com/articles/getting-started-with-nodejs) is excellent, so take a look at that. This document is essentially a more condensed, specific version of the steps described in the Heroku docs.

## 1. Install the Heroku CLI

On macOS:

```bash
brew tap heroku/brew && brew install heroku
```

...or Ubuntu:

```bash
sudo snap install --classic heroku
```

## 2. Create a Heroku App

Log into Heroku using their command line interface:

```bash
heroku login
```

Create an app in an active git directory. Doing this in the folder where your server exists is a good start, as this is what you will be hosting.

```bash
heroku create your-app-name
```

Here `your-app-name` should be the name you want to give your application. If you don't specify an app name, you'll get a random one which can sometimes be a bit iffy.

This command will both create an app on Heroku for your account. It will also add a new `remote` to your git repository.
Check this by looking at your git remotes:

```bash
git remote -v
```

## 3. Push Your code up to Heroku

```bash
git push heroku main
```

## 4. Creating a Hosted Database

Go to the heroku site and log in.

- Select your application
- `Configure Add-ons`
- Choose `Heroku Postgres`

The free tier will be adequate for our purposes. This will provide you with a `postgreSQL` pre-created database!

Check that the database exists. Click `settings` on it, and view the credentials. Keep an eye on the URI. Don't close this yet!

## 5. Seeding the Production Database

Check that your database's url is added to the environment variables on Heroku:

```bash
heroku config:get DATABASE_URL
```

If you are in your app's directory, and the database is correctly linked as an add on to Heroku, it should display a DB URI string that is exactly the same as the one in your credentials.

In your `package.json`, add the following keys to the scripts:

```json
{
  "scripts": {
    "seed:prod": "NODE_ENV=production DATABASE_URL=$(heroku config:get DATABASE_URL) npm run seed"
  }
}
```

This will establish an environment variable called `DATABASE_URL`, and set it to whatever heroku provides as your database's URL. It is essential that you do this as the database URL may change! This deals with a lack of predictability on heroku's end.

At the top of your `connection.js`, assign the value of the NODE_ENV to a variable (you may have already created this variable):

```js
const ENV = process.env.NODE_ENV || 'development';
```

It is important to check that we have either the development/test PGDATABASE variable or the production DATABASE_URL. If both are missing from the `process.env`, then throw an error.

```js
if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error('PGDATABASE or DATABASE_URL not set');
}
```

Next, add a `config` variable. If the `ENV` is production, this variable should hold a config object, containing the `DATABASE_URL` at the `connectionString` key, along with an additional `ssl.rejectUnauthorized` property set to false. This allows you to connect to the hosted database from your local machine.

```js
const ENV = process.env.NODE_ENV || 'development';
// ...
const config =
  ENV === 'production'
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {};

module.exports = new Pool(config);

// ...
```

Now, **run the seed prod script** that you added to your `package.json` earlier:

```bash
npm run seed:prod
```

It should check whether you're in production, and if you are, it should connect to the production database. Otherwise it will connect to the test or development database specified in your (`.gitignore`'d) `.env` files.

## 7. Use Heroku's PORT

In `listen.js`, make sure you take the PORT off the environment object if it's provided. This is because heroku will provide a port if in production.

```js
const { PORT = 9090 } = process.env;

app.listen(PORT, () => console.log(`Listening on ${PORT}...`));
```

## 8. Add a start script

Make sure your package.json has this as a start script:

```json
"start": "node listen.js",
```

Commit your changes, and push to heroku master.

```bash
git push heroku master
```

## 9. Review Your App

```bash
heroku open
```

Any issues should be debugged with:

```bash
heroku logs --tail
```
