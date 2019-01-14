# Markdown Parser

This is a work-in-progress - super simple Markdown parser. In order to find, match and replace Markdown with proper HTML, I am using regular expressions to match the expected format of the incoming Markdown.

## Usage

Adding `const parseMarkdownToHTML = require('./index');` where the `./index` is the path to the `index.js` file included in this repo.

You can then use that function by giving it the raw Markdown text:

```
const parseMarkdownToHTML = require('./index');

const markdown = getElementById("markdown-input").value;    // Get your markdown text - such as from an input or textarea.
const html = parseMarkdownToHTML(markdown);                 // Use the function to convert the Markdown to HTML

getElementById("converted-markdown").innerHTML = html;      // Do things with it - such as applying it to a targeted area of your HTML.
```

## TODO

- Add tests for all Markdown parsing requirements
- Make said tests pass.
- Structure & rename for import into other projects.
- Revise README once everything is completed.