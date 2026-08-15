import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

test("builds a self-contained GitHub Pages site with the favicon", () => {
  const html = fs.readFileSync("dist/index.html", "utf8");
  assert.match(html, /BUBBLE MEDIA ARCHIVE/);
  assert.match(html, /rel="icon"[^>]+icon\.png/);
  assert.match(html, /apple-touch-icon/);
  assert.ok(fs.existsSync("dist/icon.png"));
  assert.ok(fs.existsSync("dist/assets"));
});
