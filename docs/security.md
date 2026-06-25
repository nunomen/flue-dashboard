# Security Notes

The dashboard fails closed by default. `flueDashboard()` throws unless the host
provides an `auth` middleware or explicitly sets `unsafeDevMode: true`.

Workflow runs can contain sensitive application data and model content,
including:

- workflow input and result data
- prompts and messages
- tool arguments and results
- model output
- errors and stack details

The API normalizes run and event records into dashboard-owned DTOs and collapses
known sensitive keys in payload previews. Raw event inspection uses redacted
payloads by default.

Host applications should still treat the entire mounted dashboard as an admin
surface and apply the same access controls used for internal operations tools.
