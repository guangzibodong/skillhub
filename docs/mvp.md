# SkillHub MVP

The MVP is not "make the website look complete." The MVP is a real operating foundation for a skill registry and marketplace.

For the full requirements, read:

- [Product Requirements](./product-requirements.md)
- [Technical Architecture](./technical-architecture.md)

## MVP Goal

Let a real publisher submit a skill, let a real developer install it into a project, let the platform review it, and let the system record usage in a way that can later become billable.

## MVP Must Include

- Auth.
- Users and organizations.
- Organization roles.
- Publisher profiles.
- Developer projects.
- Project API keys.
- Skill create/edit/version APIs.
- Manifest validation.
- Automated runtime checks.
- Admin review queue.
- Public marketplace detail backed by database.
- Project usage events.
- Dashboard data loaded from API.
- Admin audit logs.

## MVP Can Mock

- Actual payment capture.
- Actual payout provider movement.
- Full tax/KYC automation.
- Complex runtime hosting.

Even if money movement is mocked, the ledger model must be real enough:

```text
usage event -> transaction -> transaction split -> publisher balance
```

## MVP Must Not Do

- Pay publishers directly from usage logs.
- Allow paid publishing without payout readiness.
- Allow admin finance actions without audit logs.
- Let new skill versions silently replace reviewed versions.
- Mix user dashboard permissions with admin permissions.

## Implementation Order

1. Auth and roles.
2. Projects and API keys.
3. Publisher profile and skill drafts.
4. Skill versions and manifest validation.
5. Review queue and admin decisions.
6. Public marketplace from database.
7. Runtime invocation and usage events.
8. Pricing and ledger records.
9. Payout account state and payout review.
