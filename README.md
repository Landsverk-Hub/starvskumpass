# Landsverk Starvsroynd – Hugo Quiz Site

A mobile-first job-match quiz for Landsverk, built with Hugo (Go templates) and vanilla JavaScript.

## Structure

```
starvsroynd/
├── hugo.toml                    # Hugo config
├── assets/
│   ├── css/main.css             # Mobile-first styles (brand colors)
│   └── js/quiz.js               # Client-side quiz engine
├── content/
│   └── _index.md                # Homepage content file
├── data/
│   ├── questions.toml           # 8 questions + tiebreakers
│   └── profiles.toml            # 6 job profiles (result pages)
├── layouts/
│   ├── _default/
│   │   ├── baseof.html          # Base template (head, scripts)
│   │   └── single.html          # Fallback single page
│   ├── index.html               # Homepage – the quiz SPA
│   └── partials/
│       ├── logo.html            # Landsverk logo partial
│       └── quiz-data.html       # Injects quiz data as JSON
└── static/
    └── images/
        └── profiles/            # Place 6 profile photos here
```

## How it works

1. **Landing screen** – Intro with "BYRJAÐ HER" CTA
2. **Question screens** – 8 questions, each with multiple-choice options. Each option awards points to one or more of the 6 profiles.
3. **Tiebreaker** – If top profiles are tied after 8 questions, an extra tiebreaker question is shown.
4. **Result screen** – Shows the matched profile with name, image, job description, and a CTA to contact HR.

All quiz logic runs client-side in `assets/js/quiz.js`. Hugo's data files (`data/questions.toml`, `data/profiles.toml`) are injected into the page as JSON via the `quiz-data.html` partial.

## Getting started

```bash
# Install Hugo (extended edition recommended)
# https://gohugo.io/installation/

# Run dev server
cd starvsroynd
hugo server -D

# Build for production
hugo --minify
```

## Customisation

### Edit questions
Edit `data/questions.toml`. Each question has options with a `points` map, e.g.:
```toml
points = { haraldur = 2, jens = 1 }
```

### Edit profiles
Edit `data/profiles.toml`. Each profile has name, title, role, tagline, image path, and paragraphs.

### Add profile images
Place photos in `static/images/profiles/` named after each profile key (e.g., `filip.jpg`).

### Replace the logo
Update the SVG in `layouts/partials/logo.html` with the actual Landsverk logo.

### Brand colours
All colours are CSS custom properties in `assets/css/main.css` under `:root`.
