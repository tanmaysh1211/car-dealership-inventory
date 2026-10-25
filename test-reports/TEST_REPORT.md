# Backend test report

| | |
|---|---|
| **Command** | `npm run coverage` (in `backend/`) |
| **Runner** | Vitest v5.0.5 with V8 coverage; HTTP tests with Supertest against a real PostgreSQL test database |
| **Environment** | Windows, Node v22.14.0, PostgreSQL 16.11 |
| **Date** | 25 October 2026 |
| **Raw output** | [`backend-coverage.txt`](backend-coverage.txt) |

## Summary
| Metric | Result |
|---|---|
| Test files | 6 passed, 0 failed |
| Tests | **85 passed**, 0 failed, 0 skipped |
| Duration | TODO-FILL (the `Duration` line in `backend-coverage.txt`) |

## Results by test file
| File | Tests | Result |
|---|---|---|
| `auth.test.ts` | 18 | passed |
| `middleware.test.ts` | 8 | passed |
| `vehicles.test.ts` | 25 | passed |
| `search.test.ts` | 13 | passed |
| `inventory.test.ts` | 17 | passed |
| `purchases.test.ts` | 4 | passed |

The `injected env (0) from .env.test` lines in the raw output are messages from the dotenv library, not errors.

## Coverage
| Metric | Result |
|---|---|
| Statements | 98.02% |
| Branches | 90.24% |
| Functions | 100% |
| Lines | 98.83% |

### Coverage by folder
| Folder | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| `src` (app, errors, validate) | 100% | 100% | 100% | 100% |
| `src/config` | 100% | 66.66% | 100% | 100% |
| `src/db` | 100% | 100% | 100% | 100% |
| `src/middleware` | 95.83% | 94.73% | 100% | 100% |
| `src/modules/auth` | 89.65% | 83.33% | 100% | 92% |
| `src/modules/purchases` | 100% | 100% | 100% | 100% |
| `src/modules/vehicles` | 100% | 97.29% | 100% | 100% |

### Code not fully covered
| File | Uncovered | What it is |
|---|---|---|
| `modules/auth/auth.service.ts` | lines 27-28 (83.33% of lines) | the duplicate-email race condition (two simultaneous registrations) |
| `middleware/errorHandler.ts` | line 18 (a branch) | the `console.error` call, which is skipped while tests run |
| `modules/vehicles/vehicle.repository.ts` | line 81 (a branch) | a fallback for a missing row count |
| `config/env.ts` | lines 4-9 (branches) | environment-variable fallbacks |

These are defensive paths for unexpected failures. The behaviour users depend on is covered.

## What the tests prove
- Registration validates input, hashes passwords with bcrypt, rejects duplicate emails and never accepts a client-supplied role.
- Login returns a JWT, and gives the same error for an unknown email and a wrong password.
- Protected routes reject missing, malformed, expired, forged and wrong-role tokens.
- Admin-only routes return 403 for normal users.
- `GET /api/vehicles/:id` returns one vehicle, 404 "Vehicle not found" for an unknown id, 400 for an invalid id and 401 without a token.
- Search filters by make, model, category and price range, alone or combined.
- Purchase decreases stock, records the sale price, returns 409 at zero stock and 404 for unknown vehicles.
- If recording a purchase fails, the stock decrement is rolled back.
- Ten simultaneous purchases of a vehicle with three in stock produce exactly three sales.
- Restock is admin-only and accepts only positive whole amounts.
- Purchase history survives deleting a vehicle (the vehicle link is cleared, the record stays).
- `GET /api/purchases/mine` returns only the caller's purchases, newest first, with the price paid.

## How the tests were written
The first version of the suite was written with Claude and committed in the baseline commit. `GET /api/vehicles/:id` (3 failing tests first) and `GET /api/purchases/mine` (4 failing tests first) were then built test-first: a `test:` commit where the new tests fail, then a `feat:` commit that makes them pass. Two further tests for existing behaviour (purchase history after a delete, and rollback on failure) pass immediately, so they are not red steps.
