# UML Diagrams

Mermaid-format architecture documentation for AuthorLoft. Each file renders inline on GitHub and in any Markdown viewer with Mermaid support.

| File | Diagram type | What it covers |
|---|---|---|
| [architecture.md](./architecture.md) | Flowchart | Deployment topology — Next.js on Vercel, Supabase, external services, cron schedule |
| [erd.md](./erd.md) | Entity-Relationship | Core domain tables and their relationships |
| [user-flow.md](./user-flow.md) | Flowchart | Author journey from visitor → publish → sell |
| [social-promote-sequence.md](./social-promote-sequence.md) | Sequence | End-to-end Social Promote generation + abuse-check cron |

## PlantUML variants

Same diagrams in PlantUML format (`.puml`) for tools that prefer it (IntelliJ PlantUML plugin, VS Code PlantUML, Confluence, draw.io import, etc.):

- [architecture.puml](./architecture.puml) — deployment / component diagram
- [erd.puml](./erd.puml) — entity-relationship diagram
- [user-flow.puml](./user-flow.puml) — activity diagram
- [social-promote-sequence.puml](./social-promote-sequence.puml) — sequence diagram
- [social-promote-abuse-check.puml](./social-promote-abuse-check.puml) — abuse-check cron sequence

### Rendering .puml on GitHub

GitHub does **not** auto-render .puml — you have a few options:

1. **PlantUML proxy URL** — paste this into a browser (replace branch as needed):
   `https://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/andybedford62-AI/authorloft/dev/docs/uml/architecture.puml`
2. **VS Code PlantUML extension** — install jebbs.plantuml, open the .puml file, `Alt+D` previews.
3. **IntelliJ / WebStorm** — built-in PlantUML support after installing the plugin.
4. **PlantUML web editor** — paste contents into https://www.plantuml.com/plantuml/uml/

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
