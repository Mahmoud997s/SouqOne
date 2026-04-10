/**
 * Jest Global Teardown — runs ONCE after all test suites complete.
 * Optionally drops the test database for a completely clean slate.
 */
export default async function globalTeardown() {
  console.log(`\n🧹 Test Environment Teardown — complete\n`);
}
