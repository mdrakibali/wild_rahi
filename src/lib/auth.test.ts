import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPassword,
  parseCookies,
  signSessionToken,
  verifyPassword,
  verifySessionToken,
} from './auth';

test('hashPassword and verifyPassword validate matching and non-matching secrets', () => {
  const hash = hashPassword('WildRahi#2026');
  assert.ok(hash.includes(':'));
  assert.equal(verifyPassword('WildRahi#2026', hash), true);
  assert.equal(verifyPassword('WrongPassword', hash), false);
  assert.equal(verifyPassword('WildRahi#2026', 'malformed-hash'), false);
});

test('signSessionToken and verifySessionToken round-trip valid tokens and reject tampering', () => {
  const secret = 'test-secret-key';
  const token = signSessionToken(
    { id: 'admin-1', email: 'admin@wildrahi.com', name: 'Razaul Hafiz Rahi' },
    secret,
    60_000
  );
  const payload = verifySessionToken(token, secret);
  assert.ok(payload);
  assert.equal(payload.email, 'admin@wildrahi.com');
  assert.equal(payload.role, 'admin');

  // Tampered token rejected
  assert.equal(verifySessionToken(`${token}x`, secret), null);
  // Wrong secret rejected
  assert.equal(verifySessionToken(token, 'other-secret'), null);
});

test('verifySessionToken rejects expired tokens', () => {
  const secret = 'test-secret-key';
  const expiredToken = signSessionToken(
    { id: 'admin-1', email: 'admin@wildrahi.com', name: 'Razaul Hafiz Rahi' },
    secret,
    -1000
  );
  assert.equal(verifySessionToken(expiredToken, secret), null);
});

test('parseCookies parses standard HTTP Cookie header', () => {
  const cookies = parseCookies('wr_session=abc.123; theme=dark; empty=');
  assert.equal(cookies.wr_session, 'abc.123');
  assert.equal(cookies.theme, 'dark');
  assert.equal(cookies.empty, '');
});
