const test = require("node:test");
const assert = require("node:assert");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-ci-only";

const { verifyToken, checkRole } = require("../middleware/authmiddleware");

function mockRes() {
  const res = {};
  res.statusCode = null;
  res.body = null;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
}

test("verifyToken rejects requests with no Authorization header", () => {
  const req = { headers: {} };
  const res = mockRes();
  let nextCalled = false;

  verifyToken(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, false);
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(res.body.message, "No token provided");
});

test("verifyToken rejects an invalid/garbage token", () => {
  const req = { headers: { authorization: "Bearer not-a-real-token" } };
  const res = mockRes();
  let nextCalled = false;

  verifyToken(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, false);
  assert.strictEqual(res.statusCode, 401);
});

test("verifyToken accepts a valid token and attaches decoded user to req", (t, done) => {
  const token = jwt.sign(
    { id: 1, email: "test@example.com", role: "user" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = mockRes();

  verifyToken(req, res, () => {
    assert.strictEqual(req.user.email, "test@example.com");
    assert.strictEqual(req.user.role, "user");
    done();
  });
});

test("checkRole allows a user whose role is in the allowed list", () => {
  const req = { user: { role: "admin" } };
  const res = mockRes();
  let nextCalled = false;

  checkRole(["admin", "staff"])(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, true);
});

test("checkRole blocks a user whose role is not in the allowed list", () => {
  const req = { user: { role: "customer" } };
  const res = mockRes();
  let nextCalled = false;

  checkRole(["admin", "staff"])(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, false);
  assert.strictEqual(res.statusCode, 403);
});
