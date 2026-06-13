# Security & reliability scan

Load when the diff touches **untrusted input, auth, data writes, network calls, file paths, or concurrency**. For each finding, state both *exploitability* (how hard to trigger) and *impact* (what breaks). Skip anything a linter/SAST in CI already catches.

## Input / output safety

- **Injection** — SQL / NoSQL / command / GraphQL built via string concat or template literals instead of parameterized queries.
- **XSS** — `dangerouslySetInnerHTML`, `innerHTML =`, unescaped template output of user data.
- **SSRF** — user-controlled URL reaching an internal host without an allowlist.
- **Path traversal** — user input in a file path without sanitizing `../`.
- **Prototype pollution** — merging/spreading user objects into trusted ones (`Object.assign`, deep-merge).
- **Unsafe deserialization** — `eval`, `pickle`, native deserializers on untrusted bytes.

## AuthN / AuthZ

- New endpoint shipped **without an auth guard** or RBAC check.
- Missing tenant / ownership check on a read or write (IDOR — object id taken from the request and used directly).
- Trusting a client-supplied role, flag, or user id.
- JWT: accepting `alg: none` / algorithm confusion, missing `exp` validation, secrets hardcoded, sensitive data in the (base64, not encrypted) payload.

## Secrets & config

- API keys / tokens / passwords committed, logged, or echoed into error messages.
- Internal stack traces or DB errors returned to the caller.
- Insecure default flipped on (debug mode, permissive CORS `*`, disabled TLS verify).

## Reliability & concurrency

- **Race conditions** — check-then-act / TOCTOU, shared mutable state without a lock, non-atomic read-modify-write.
- **Unbounded work** — loops, recursion, or allocations sized by user input with no cap; missing pagination.
- **Resource leaks** — file / socket / connection opened on a path that can return or throw before close.
- Weak crypto (MD5/SHA1 for security, ECB mode, `Math.random()` for tokens).
