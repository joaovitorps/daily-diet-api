## Gotchas

I had issues with running migrations on beforeEach test because of concurrency. Since vitest runs test files concurrently I was having issues with lock migration table since I was rolling back migrations then running latest again, even when deleting sqlite file I was still having this issue.

```ts
// attempt 1

beforeAll(() => {
  const filePath = path.join(__dirname, "../infra/database/test.sqlite3");

  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }
});

beforeEach(async () => {
  await db.migrate.latest().then(() => console.log("Migrations completed"));
});
```

```ts
// attempt 2

beforeEach(async () => {
  await db.migrate
    .rollback(undefined, true)
    .then(() => console.log("Migrations rolled back"));
  await db.migrate.latest().then(() => console.log("Migrations completed"));
});
```

Searching around, what really solved my issue was to instead of creating a file for test database, run it in memory with `filename: ':memory:'` 🤯. So basically it will only exist in memory and is deleted when the connection drops, perfect for testing.

[Final result](https://github.com/joaovitorps/daily-diet-api/blob/3cf9e6d0f6fba5df57d7ac1a18bcc6fed2507e39/infra/database/database.ts#L29)

```ts
beforeEach(async () => {
  await db.migrate.latest().then(() => console.log("Migrations completed"));
});
```

[Useful `dev.to` link for reference](https://dev.to/rukykf/integration-testing-with-nodejs-jest-knex-and-sqlite-in-memory-databases-2ila)

### Application Rules

- [x] It should be possible to create a user
- [x] It should be possible to identify the user between requests
- [x] It should be possible to record a meal with the following information:
      _Meals must be related to a user._
  - [x] Name
  - [x] Description
  - [x] Date and Time
  - [x] Is it within the diet or not
- [x] It should be possible to edit a meal, being able to change all the data above
- [x] It should be possible to delete a meal
- [x] It should be possible to list all the meals of a user
- [x] It should be possible to view a single meal
- [ ] It should be possible to retrieve a user's metrics
  - [ ] Total number of meals recorded
  - [ ] Total number of meals within the diet
  - [ ] Total number of meals outside the diet
  - [ ] Best sequence of meals within the diet
- [ ] The user can only view, edit, and delete the meals they created
