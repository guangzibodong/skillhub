# Skill Package Format

Every SkillHub skill package includes a `skillhub.json` manifest.

```json
{
  "schemaVersion": "0.1",
  "name": "browser-research",
  "displayName": "Browser Research",
  "version": "0.1.0",
  "description": "Research a web topic and return cited findings.",
  "tags": ["research", "browser", "citations"],
  "runtime": {
    "type": "http",
    "entrypoint": "https://example.com/skills/browser-research"
  },
  "permissions": {
    "network": true,
    "browser": true,
    "filesystem": "none",
    "secrets": []
  },
  "inputSchema": {
    "type": "object",
    "required": ["query"],
    "properties": {
      "query": { "type": "string" }
    }
  },
  "outputSchema": {
    "type": "object",
    "required": ["summary", "sources"],
    "properties": {
      "summary": { "type": "string" },
      "sources": {
        "type": "array",
        "items": { "type": "string" }
      }
    }
  }
}
```

Recommended package files:

- `skillhub.json`: manifest.
- `instructions.md`: agent-facing usage notes.
- `examples/*.json`: sample calls.
- `evals/*.json`: expected behavior and regression checks.
