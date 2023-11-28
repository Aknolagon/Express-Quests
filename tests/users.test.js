const request = require("supertest");

const app = require("../src/app");

const database = require("../database");

afterAll(() => database.end());

const crypto = require("node:crypto");

describe("GET /api/users", () => {
  it("should return all users", async () => {
    const response = await request(app).get("/api/users");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });
});

describe("GET /api/users/:id", () => {
  it("should return one user", async () => {
    const response = await request(app).get("/api/users/1");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });

  it("should return no user", async () => {
    const response = await request(app).get("/api/users/0");

    expect(response.status).toEqual(404);
  });
});

describe("POST /api/users", () => {
  it("should return created user", async () => {
    const newUser = {
      firstname: "Marie",
      lastname: "Martin",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Paris",
      language: "French",
    };

    const response = await request(app).post("/api/users").send(newUser);

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(typeof response.body.id).toBe("number");

    const [result] = await database.query(
      "SELECT * FROM users WHERE id=?",
      response.body.id
    );

    const [usersDatabase] = result;

    expect(usersDatabase).toHaveProperty("id");
    expect(usersDatabase).toHaveProperty("email");
    expect(usersDatabase.firstname).toStrictEqual(newUser.firstname);
    expect(usersDatabase.lastname).toStrictEqual(newUser.lastname);
    expect(usersDatabase.email).toStrictEqual(newUser.email);
    expect(usersDatabase.city).toStrictEqual(newUser.city);
    expect(usersDatabase.language).toStrictEqual(newUser.language);
  });
  it("should return an error", async () => {
    const userWithMissingProps = { email : "harry.potter@wild.co" };

    const response = await request(app)
      .post("/api/users")
      .send(userWithMissingProps);

    expect(response.status).toEqual(500);
  });
});
