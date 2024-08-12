const { MongoClient } = require("mongodb");
const { faker } = require("@faker-js/faker");
const {
  MONGODB_URI,
  DEFAULT_PASSWORD,
  NO_USERS_TO_CREATE,
} = require("./config");

async function main() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    await listDatabases(client);

    // create data for users
    const users = createUserData(NO_USERS_TO_CREATE);
    // create a single ACSP
    const acsp = createAcspData(1);
    // create member data for the users and the above newly created ACSP
    const acspMembers = createAcspMemberData(acsp[0], users);

    await addUserDataToMongo(client, users);
    await addAcspDataToMongo(client, acsp);
    await addAcspMemberDataToMongo(client, acspMembers);
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

async function addUserDataToMongo(client, newUsers) {
  const result = await client
    .db("account")
    .collection("users")
    .insertMany(newUsers);

  console.log(
    `${result.insertedCount} new users(s) created with the following ids:`
  );
  console.log(result.insertedIds);
}

async function addAcspDataToMongo(client, acsp) {
    const result = await client
      .db("acsp_members")
      .collection("acsp_data")
      .insertMany(acsp);
  
    console.log(
      `${result.insertedCount} new acsp(s) created with the following ids:`
    );
    console.log(result.insertedIds);
  }

  async function addAcspMemberDataToMongo(client, acspMembers) {
    const result = await client
      .db("acsp_members")
      .collection("acsp_members")
      .insertMany(acspMembers);
  
    console.log(
      `${result.insertedCount} new acsp members created with the following ids:`
    );
    console.log(result.insertedIds);
  }

function createUserData(count) {
  let persons = [];
  for (let i = 0; i < count; i += 1) {
    const forename = faker.person.firstName();
    const surname = faker.person.lastName();
    const displayNameOptions = ["Not Provided", `${forename} ${surname}`]
    persons.push({
        _id: faker.string.uuid().replace(/-/g,""),
        email: faker.internet.email({ firstName: forename, lastName: surname }).toLowerCase(),
      forename,
      surname,
      password: DEFAULT_PASSWORD,
      display_name: displayNameOptions[Math.floor(Math.random() * 2)],
    });
  }
  return persons;
}

function createAcspData(count) {
  let acsps = [];
  for (let i = 0; i < count; i += 1) {
    const companyName = faker.company.name();
    console.log(companyName);
    acsps.push({
        _id: faker.string.uuid().replace(/-/g,""),
        acsp_name: companyName,
      acsp_status: "active",
      version: 0,
      _class: "uk.gov.companieshouse.acsp.manage.users.model.AcspDataDao",
    });
  }
  return acsps;
}

function createAcspMemberData(acsp, users) {
  const roles = ["admin", "owner", "standard"];
  return users.map((user) => ({
    _id: faker.string.uuid().replace(/-/g,""),
    acsp_number: acsp._id,
    user_id: user._id,
    user_role: roles[Math.floor(Math.random() * 3)],
    created_at: new Date("2023-07-03T11:55:23.649668000"),
    added_at: new Date("2023-07-03T11:55:23.649668000"),
    added_by: null,
    removed_at: null,
    removed_by: null,
    status: "active",
    etag: "b035bfdb99170913f11f73ac0d0e8afb9f15c13f",
    version: 0,
    _class: "uk.gov.companieshouse.acsp.manage.users.model.AcspMembersDao",
  }));
}

main().catch(console.error);
