# Muhammad Ali, public health portfolio

Source for the personal site published with GitHub Pages.

## How it's built

Plain static HTML, one stylesheet, and one small script. No framework, no build step, no tracking, no third-party requests (fonts are self-hosted).

```
index.html                 Home
work/index.html            Case-study list, code, other projects
work/*.html                One page per case study
experience.html            Timeline of roles
about.html                 Bio, education, publication, presentations, certifications
resume.html                Web résumé with a "Print or save as PDF" button
404.html                   Not-found page
assets/css/site.css        All styling (colors and fonts are set at the top)
assets/js/site.js          Mobile menu and print button
assets/img/                Figures, favicon, social share image
assets/fonts/              Newsreader, Public Sans, JetBrains Mono (SIL Open Font License)
code/                      SAS and R code shown on the site
```

## Preview locally

From this folder run `python -m http.server 8000`, then open http://localhost:8000. Opening the files directly also works, except for the fonts in some browsers.

## Publishing

GitHub Pages serves the `main` branch from the repository root. Any commit to `main` goes live in a minute or two. Settings, then Pages, should show "Deploy from a branch: main / (root)".

## Common updates

**Add a project.** Copy one of the files in `work/` (for example `work/telemedicine-thesis.html`), rename it, and replace the text. Add a link to it in `work/index.html`, and to the home page under "Selected work" if it should be featured. Put any images in `assets/img/` and give each one alt text that describes what the chart shows.

**Add a résumé PDF.** Save it as `assets/resume/Muhammad_Ali_Resume.pdf`, then add a link on `resume.html` next to the print button:
`<a class="btn btn-quiet" href="assets/resume/Muhammad_Ali_Resume.pdf">Download PDF</a>`.
Remove your phone number from the PDF first; this site is public.

**Update experience.** Edit `experience.html` (full list) and the short list on `index.html`. After December 2026, change "MPH candidate" and "Expected Dec 2026" on `index.html`, `about.html`, `resume.html`, and the footer of each page.

**Change the email or LinkedIn link.** Search all `.html` files for `alikhanjasra23@gmail.com` or `linkedin.com/in/mali-j23` and replace.
