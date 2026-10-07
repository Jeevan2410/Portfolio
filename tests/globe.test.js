import { test } from "node:test";
import assert from "node:assert/strict";
import { arcPoint, fibonacciSphere, latLng, project, rotate } from "../src/globe.js";

const length = ([x, y, z]) => Math.hypot(x, y, z);
const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

test("fibonacciSphere spreads points over the whole unit sphere", () => {
  const points = fibonacciSphere(400);
  assert.equal(points.length, 400);
  assert.ok(points.every((p) => close(length(p), 1)));
  const north = points.filter(([, y]) => y > 0).length;
  assert.ok(Math.abs(north - 200) <= 1, "half the points are in each hemisphere");
});

test("rotate keeps points on the sphere and turns them the right way", () => {
  const [x, , z] = rotate([0, 0, 1], Math.PI / 2, 0);
  assert.ok(close(x, 1) && close(z, 0, 1e-12), "a quarter turn of yaw moves +z to +x");
  const [, y] = rotate([0, 0, 1], 0, Math.PI / 2);
  assert.ok(close(y, -1), "pitching forward tips the front point down");
  assert.ok(close(length(rotate([0.3, 0.5, 0.81], 1.2, -0.4)), length([0.3, 0.5, 0.81])));
});

test("project maps to canvas pixels with y pointing down", () => {
  assert.deepEqual(project([1, 1, 0.5], 100, 100, 50), [150, 50, 0.5]);
});

test("latLng puts the equator at y = 0 and the pole at y = 1", () => {
  assert.ok(close(latLng(0, 0)[1], 0));
  assert.ok(close(latLng(Math.PI / 2, 0)[1], 1));
});

test("arcPoint starts and ends on the sphere and rises in between", () => {
  const a = [1, 0, 0];
  const b = [0, 0, 1];
  assert.ok(close(length(arcPoint(a, b, 0)), 1));
  assert.ok(close(length(arcPoint(a, b, 1)), 1));
  assert.ok(close(length(arcPoint(a, b, 0.5, 0.25)), 1.25));
});
