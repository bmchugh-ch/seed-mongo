const { MongoClient } = require("mongodb");
const { faker } = require("@faker-js/faker");
const { MONGODB_URI, DEFAULT_PASSWORD, NO_USERS_TO_CREATE } = require('./config');

async function main() {

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    await listDatabases(client);
    const users = createUsers(NO_USERS_TO_CREATE);
    await createMultipleUsers(client, users);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

async function listDatabases(client) {
  databasesList = await client.db().admin().listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach((db) => console.log(` - ${db.name}`));
}

async function createMultipleUsers(client, newUsers) {
  const result = await client
    .db("account")
    .collection("users")
    .insertMany(newUsers);

  console.log(
    `${result.insertedCount} new users(s) created with the following ids:`
  );
  console.log(result.insertedIds);
}

function createUsers(count) {
  let persons = [];
  for (let i = 0; i < count; i += 1) {
    const forename = faker.person.firstName();
    const surname = faker.person.lastName();
    persons.push({
        _id:faker.string.uuid(),
      email:faker.internet.email(),
      forename,
      surname,
      password:DEFAULT_PASSWORD,
      display_name:`${forename} ${surname}`
    });
  }
  return persons;
}

main().catch(console.error);
