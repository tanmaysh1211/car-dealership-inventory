# Backend test report

| | |
|---|---|
| **Command** | `npm run coverage` (in `backend/`) |
| **Runner** | Vitest v5.0.5 with V8 coverage; HTTP tests with Supertest against a real PostgreSQL test database |
| **Environment** | Windows, Node : v22.14.0 , psql (PostgreSQL) 16.11 |
| **Date** | 25 October 2026 (run started 16:53:47) |
| **Raw output** | [`backend-coverage.txt`](backend-coverage.txt) |

## Summary
| Metric | Result |
|---|---|
| Test files | 5 passed, 0 failed |
| Tests | **75 passed**, 0 failed, 0 skipped |
| Duration | 19.34s |

## Results by test file
| File | Tests | Time | Result |
|---|---|---|---|
| `auth.test.ts` | 18 | 4.6s | passed |
| `vehicles.test.ts` | 21 | 2.6s | passed |
| `search.test.ts` | 13 | 1.6s | passed |
| `inventory.test.ts` | 15 | 1.1s | passed |
| `middleware.test.ts` | 8 | 1.3s | passed |

The `injected env (0) from .env.test` lines in the raw output are messages from the dotenv library, not errors.

## Coverage
| Metric | Result |
|---|---|
| Statements | 95.65% |
| Branches | 87.5% |
| Functions | 100% |
| Lines | 96.15% |

### Coverage by folder
| Folder | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| `src` (app, errors, validate) | 100% | 100% | 100% | 100% |
| `src/config` | 100% | 66.66% | 100% | 100% |
| `src/db` | 100% | 100% | 100% | 100% |
| `src/middleware` | 87.5% | 84.21% | 100% | 90.47% |
| `src/modules/auth` | 89.65% | 83.33% | 100% | 92% |
| `src/modules/vehicles` | 98.14% | 97.14% | 100% | 97.75% |

### Files below 100% line coverage
| File | Lines | Uncovered lines | What they are |
|---|---|---|---|
| `middleware/errorHandler.ts` | 77.77% | 18-19 | the generic 500 fallback for unexpected errors |
| `modules/auth/auth.service.ts` | 83.33% | 27-28 | the duplicate-email race condition (two simultaneous registrations) |
| `modules/vehicles/vehicle.repository.ts` | 95.55% | 117-118 | transaction rollback when the database itself fails mid-purchase |
| `config/env.ts` | 100% | none | some environment-variable fallbacks (66.66% of branches) |

These are defensive paths for unexpected failures. The behaviour users depend on is covered.

## What the tests prove
- Registration validates input, hashes passwords with bcrypt, rejects duplicate emails and never accepts a client-supplied role.
- Login returns a JWT, and gives the same error for an unknown email and a wrong password.
- Protected routes reject missing, malformed, expired, forged and wrong-role tokens.
- Admin-only routes return 403 for normal users.
- Search filters by make, model, category and price range, alone or combined.
- Purchase decreases stock, records the sale price, returns 409 at zero stock and 404 for unknown vehicles.
- Ten simultaneous purchases of a vehicle with three in stock produce exactly three sales.
- Restock is admin-only and accepts only positive whole amounts.
- A vehicle that has been purchased can still be deleted.
