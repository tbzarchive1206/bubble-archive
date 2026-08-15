import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const archive = JSON.parse(fs.readFileSync("app/data/archive.json", "utf8"));

test("contains the complete static member index", () => {
  assert.equal(archive.members.length, 11);
  assert.equal(archive.members.reduce((sum, member) => sum + member.media.length, 0), 4233);
  assert.deepEqual(archive.members.map((member) => member.name), ["Sangyeon", "Jacob", "Younghoon", "Hyunjae", "Juyeon", "Kevin", "Q", "Sunwoo", "Eric", "Haknyeon", "New"]);
});

test("preserves exact source links and external Kevin archive", () => {
  assert.ok(archive.members.every((member) => /^https:\/\/drive\.google\.com\/drive\/folders\//.test(member.url)));
  assert.equal(archive.members.find((member) => member.name === "Kevin").externalUrl, "https://x.com/kyuranghae_/status/1912709151215800495");
});

test("uses reliable date metadata without converting export timestamps", () => {
  const q = archive.members.find((member) => member.name === "Q");
  assert.equal(q.media.filter((item) => item.dateKey).length, 449);
  const sunwoo = archive.members.find((member) => member.name === "Sunwoo");
  assert.ok(sunwoo.media.every((item) => item.dateKey === null));
});

test("repository has deployment only and no scheduled synchronization", () => {
  const workflow = fs.readFileSync(".github/workflows/deploy-pages.yml", "utf8");
  assert.doesNotMatch(workflow, /schedule:|GOOGLE_DRIVE_API_KEY|sync-drive/);
});
