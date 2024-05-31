const app = require("./app.js");
const { PORT = 1337 } = process.env;

app.listen(PORT, () => console.log(`Listening on ${PORT}...`));