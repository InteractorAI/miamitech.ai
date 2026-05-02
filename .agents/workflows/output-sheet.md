---
description: Export the MiamiTech Google Sheet tabs into markdown files
---

# Output Sheet As Markdown

Fetch every configured Google Sheet tab and write a simple markdown export under `data/`.

## Source

- Base URL: `https://docs.google.com/spreadsheets/d/1hqKbGMHKT3pbgFRLKVWcJ7xgInwe6FLwYaMn1uld_Pg/export?format=csv&gid=`
- Tab configuration source of truth: `src/lib/googleSheets.ts`

## Tabs

| File | Tab key | GID | Skip rows | Columns |
| --- | --- | --- | --- | --- |
| `data/capital.md` | `VCs` | `0` | 4 | name, top10, website, checkSize, contact, location, description, type, stage, focus, leads, notes |
| `data/spaces.md` | `Spaces` | `1501823864` | 1 | name, location, type, url |
| `data/communities.md` | `Communities` | `585764250` | 1 | name, url, calendar |
| `data/ambassadors.md` | `Ambassadors` | `1836408446` | 1 | name, linkedin, twitter |
| `data/contributors.md` | `Contributors` | `18134085` | 1 | name, linkedin, twitter |
| `data/conferences.md` | `Conferences` | `1124651295` | 1 | name, website, linkedin, twitter |
| `data/news.md` | `News` | `156713271` | 1 | name, note, website |
| `data/faqs.md` | `FAQs` | `418679874` | 1 | question |
| `data/accelerators.md` | `Accelerators` | `1044145407` | 1 | name, website, stage, checkSize, note |

## Steps

1. Read the current tab definitions from `src/lib/googleSheets.ts`.
2. Fetch each tab CSV from `<Base URL><GID>`.
3. Parse CSV with a real parser or structured CSV handling. Values may be quoted and contain commas.
4. Skip the configured header rows and blank rows.
5. Write one markdown file per tab under `data/`.
6. Omit empty fields from each entry.
7. After writing, report each file written and its entry count.

## Format

Use simple bullet blocks, no tables or HTML.

```md
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

For capital entries where `top10` is `yes`, mark the header with `Top 10`.
