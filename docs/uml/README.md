# UML Diagrams

Mermaid-format architecture documentation for AuthorLoft. Each file renders inline on GitHub and in any Markdown viewer with Mermaid support.

| File | Diagram type | What it covers |
|---|---|---|
| [architecture.md](./architecture.md) | Flowchart | Deployment topology — Next.js on Vercel, Supabase, external services, cron schedule |
| [erd.md](./erd.md) | Entity-Relationship | Core domain tables and their relationships |
| [user-flow.md](./user-flow.md) | Flowchart | Author journey from visitor → publish → sell |
| [social-promote-sequence.md](./social-promote-sequence.md) | Sequence | End-to-end Social Promote generation + abuse-check cron |

## Exporting to images

For a static PNG/SVG (e.g. for slide decks):

1. Open https://mermaid.live
2. Paste the diagram block (the part between the \`\`\`mermaid fences)
3. Use the "Actions" panel to export PNG or SVG

For a local CLI:

```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i docs/uml/architecture.md -o architecture.png
```

## Updating

These diagrams are source-of-truth-adjacent — keep them in sync when major architectural shifts land. Routine refactors don't need a re-draw.
