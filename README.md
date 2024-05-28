## Local Backend API Setup

To get the backend API up and running on your local machine, follow these steps:

### **Prerequisites**

Before proceeding, ensure you have the following installed:

- **[Node.js](https://nodejs.org/)**
- **[PostgreSQL](https://www.postgresql.org/)**

### 1. Clone the Repository

Begin by cloning the repository to your local machine. Use the following command in your terminal, ensuring you navigate to your desired directory:

```bash
git clone https://github.com/michael-farah/news-api.git
```

### 2. Install Dependencies

Next, install the project dependencies using npm. Execute the following command in your terminal (ensure you're within the repository directory):

```bash
npm install
```

This command will fetch and install the required packages:

- **Dependencies:**
  - [**`dotenv`**](https://www.npmjs.com/package/dotenv)
  - [**`jest`**](https://jestjs.io/)
  - [**`jest-extended`**](https://www.npmjs.com/package/jest-extended)
  - [**`pg`**](https://node-postgres.com/)
  - [**`pg-format`**](https://www.npmjs.com/package/pg-format)

### 3. Database Setup and Seed Data

Refer to the `package.json` file for relevant scripts to set up the databases. Follow these steps:

#### a. Set Up Databases

Run the following command to initialise the databases:

```bash
npm run setup-dbs
```

#### b. Create Environment Variable Files

You'll need to create two `.env` files:

- **`.env.development`**
- **`.env.test`**

#### c. Add Database Configurations

In the **`.env.development`** file, include the following line:

```plaintext
PGDATABASE=your_development_database_name
```

In the **`.env.test`** file, include the following line:

```plaintext
PGDATABASE=your_test_database_name
```

Replace `your_development_database_name` and `your_test_database_name` with the appropriate database names as specified in the `/db/setup.sql` file.