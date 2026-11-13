# Paper-Graveyard — Research Library

A public, read-only view of a personal research index. The interface is in English and organized as a navigable hierarchy:

`Home → Index → International Journals → Shenzhen / Other Regions & Cross-regional Studies`

The page keeps the research archive deliberately quiet: near-white light-gray reading surfaces, Times New Roman for secondary text and paper titles, and small green/yellow accents only where they mark hierarchy or interaction.

## Browse

- Open the [live site](https://h77-lin.github.io/Paper-Graveyard/#library).
- Use **Index** to move from the top-level categories into subcategories.
- Select **Include subcategories** when you want to search a whole branch.
- Search covers titles, authors, DOI, abstracts, topics and tags.

This GitHub Pages version is static and read-only. It does not save edits or contain local reading notes. Personal records belong in the separate local application and its hidden `.local/` directory; that directory must never be uploaded to a public repository.

## Files

- `index.html` — English interface and hierarchy
- `styles.css` — light-gray reading surfaces and restrained accents
- `script.js` — category navigation, filtering and search
- `categories.json` — editable public category tree
- `papers.json` — public bibliographic records only
- `page-motion.js`, `gsap.min.js` — restrained hierarchy transition with reduced-motion support

To update the public view, upload the complete static package to the repository root and wait for GitHub Pages to redeploy. Keep private notes and the local application outside this repository.
