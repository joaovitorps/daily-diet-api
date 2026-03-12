## Gotchas

I had issues with running migrations on beforeEach test because of concurrency. Since vitest runs test files concurrently I was having issues with lock migration table since I was rolling back migrations then running latest again, even when deleting sqlite file I was still having this issue.

```ts
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
beforeEach(async () => {
  await db.migrate
    .rollback(undefined, true)
    .then(() => console.log("Migrations rolled back"));
  await db.migrate.latest().then(() => console.log("Migrations completed"));
});
```

Searching around, what really solved my issue was to instead of creating a file for test database, run it in memory with `filename: ':memory:'` 🤯. So basically it will only exist in memory and is deleted when the connection drops, perfect for testing.

Adding this link for reference:
https://dev.to/rukykf/integration-testing-with-nodejs-jest-knex-and-sqlite-in-memory-databases-2ila

### Regras da aplicação

- [x] Deve ser possível criar um usuário
- [x] Deve ser possível identificar o usuário entre as requisições
- [x] Deve ser possível registrar uma refeição feita, com as seguintes informações:
      _As refeições devem ser relacionadas a um usuário._
  - [x] Nome
  - [x] Descrição
  - [x] Data e Hora
  - [x] Está dentro ou não da dieta
- [x] Deve ser possível editar uma refeição, podendo alterar todos os dados acima
- [ ] Deve ser possível apagar uma refeição
- [ ] Deve ser possível listar todas as refeições de um usuário
- [ ] Deve ser possível visualizar uma única refeição
- [ ] Deve ser possível recuperar as métricas de um usuário
  - [ ] Quantidade total de refeições registradas
  - [ ] Quantidade total de refeições dentro da dieta
  - [ ] Quantidade total de refeições fora da dieta
  - [ ] Melhor sequência de refeições dentro da dieta
- [ ] O usuário só pode visualizar, editar e apagar as refeições o qual ele criou
