---
description: Fetch all Google Sheet tabs and export as structured markdown files for human/agent consumption
---

# Output Sheet as Markdown

Fetches every tab from the project's Google Sheet and writes each one to a simple markdown file under `data/`.

## Sheet Info

- **Base URL**: `https://docs.google.com/spreadsheets/d/1hqKbGMHKT3pbgFRLKVWcJ7xgInwe6FLwYaMn1uld_Pg/export?format=csv&gid=`
- **Source of truth for tab GIDs and column structure**: `src/lib/googleSheets.ts`

## Tabs to Export

| File | Tab Key | GID | Skip Rows | Columns (in order) |
|---|---|---|---|---|
| `data/capital.md` | VCs | `0` | 4 | name, top10, website, checkSize, contact, location, description, type, stage, focus, leads, notes |
| `data/spaces.md` | Spaces | `1501823864` | 1 | name, location, type, url |
| `data/communities.md` | Communities | `585764250` | 1 | name, url, calendar |
| `data/ambassadors.md` | Ambassadors | `1836408446` | 1 | name, linkedin, twitter |
| `data/contributors.md` | Contributors | `18134085` | 1 | name, linkedin, twitter |
| `data/conferences.md` | Conferences | `1124651295` | 1 | name, website, linkedin, twitter |
| `data/news.md` | News | `156713271` | 1 | name, note, website |
| `data/faqs.md` | FAQs | `418679874` | 1 | question |

## Steps

1. **Fetch each tab's CSV** using `read_url_content` on the URL `<Base URL><GID>`. Skip the specified number of header rows. Filter out blank rows.

2. **Parse the CSV** carefully — values may be quoted and contain commas. Strip surrounding quotes and unescape `""` → `"`.

3. **Write a markdown file** for each tab to `data/<name>.md` in the project root. Format each entry as a simple bullet block. Omit fields that are empty. Example format:

```markdown
# Spaces

- **The LAB Miami**
  - Location: Wynwood, Miami
  - Type: Coworking
  - URL: https://thelabmiami.com

- **CIC Miami**
  - Location: Brickell, Miami
  - Type: Innovation Center
  - URL: https://cic.us/miami
```

4. **After writing all files**, list which files were written and how many entries each contains.

## Notes

- The `data/` directory should be created if it doesn't exist (the write_to_file tool handles this automatically).
- If a field like `twitter`, `linkedin`, or `calendar` is blank for an entry, skip that bullet line entirely.
- For the Capital tab, if `top10` is "yes", note it as `⭐ Top 10` in the entry header.
- Keep the format minimal and human-readable — no tables, no HTML, just bullets.
