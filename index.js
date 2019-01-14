
const htmlEncode = (str) => {
    str = str.replace(/[\u00A0-\u9999<>\&]/g, (i) => {
        return `&#${i.charCodeAt(0)};`;
    })
    console.log('encoded')
    console.log(str)
    return str;
}

const parseForNamedUrls = (lines) => {
    let dict = [];
    lines.forEach((line) => {
        if (linkNamingRegex.test(line)) {
            console.log(line);
            const lineItems = line.split(": ");
            const linkName = lineItems[0].replace(/[\[\]:]/g, '').toLowerCase(); // Case insensitive
            const dataItems = lineItems[1].trim().split(/\s+/);

            dict[linkName] = {
                url: dataItems[0],
                title: dataItems[1]
            }
            console.log(`Ordinal ${linkName} Url ${dataItems[0]} Title ${dataItems[1]}`)
            console.log(dict)
        } // TODO - ENSURE YOU ACCOUNT FOR THIS LATER WITH LNIKS STUFF
    })
    return dict;
}
function parseMarkdownToHTML(rawText) {
    const lines = rawText.split("\n");

    // Regular Expressions
    const headingRegex = /^(#+)\s/;
    const ulRegex = /^([-*+])\s/;
    const olRegex = /^([0-9]\.)\s/;
    const emRegex = /(([*](\w|\s)+[*])+|([_](\w|\s)+[_])+)/g;
    const boldRegex = /(([*]{2}(\w|\s)+[*]{2})+|([_]{2}(\w|\s)+[_]{2})+)/g;
    const linkRegex = /((\[([\w\s]+)\])\(([\w:/.]*)\))/g;
    const linkNamingRegex = /^\[([\w|\s]+)\]:/;
    const imageRegex = /(!(\[([\w\s]+)\])\(([\w:/.]*)\))/g;
    const namedImageRegex = /!\[([\w|\s]+)\]\[([\w|\s]+)\]/g;
    const namedLinkRegex = /\[([\w|\s]+)\]\[([\w|\s]+)\]/g;
    const blockQuoteRegex = /^>\s/;
    const emptyRegex = /^\s+$/;
    const endingTagRegex = /^<\/\w+>$/;
    const inlineCodeRegex = /([`])(?:(?=(\\?))\2.)*?\1/g;

    // Create a spot holding objects holding numbered link information.
    let numberedLinks = parseForNamedUrls(lines);
    // Will track whether we're currently parsing lines within a code block;
    let parsingCodeBlock = false;

    // Fill dictionary before doing any thing with the output HTML
    // This adds the numbered linkes (ie [1]: google.com "Google") to an array
    // so that we can look them up while converting.
    

    let outputHTML = lines.reduce((output, line, linesIndex) => {
        // Start by checking for empty line. Push a <br /> to the output and return it.
        if (line.replace(/\s+/, '').length === 0) {
            output.push("");
            return output;
        }
        // Next - check if we've already appended a closing tag - if so, just continue.
        if (endingTagRegex.exec(line)) {
            console.log("Has an ending HTML tag.")
            return output;
        }
        if (line === "```") {
            const outputText = parsingCodeBlock ? "</pre></code>" : "<pre><code>";
            output.push(outputText);
            parsingCodeBlock = !parsingCodeBlock;
            return output;
        }
        if (parsingCodeBlock) {
            output.push(htmlEncode(line) + "\n");
            return output;
        }

        // Get the last and next lines for quick testing for lists and other
        // multi-line processes.
        const previousLine = lines[linesIndex - 1];
        const nextLine = lines[linesIndex + 1];

        /* Wrapping Tags */
        /* <h1-6> && <ul> && <ol> */

        const wrappingTags = []

        // Check the line to see if it is a list item.

        // Check for List Items
        const ul_li = ulRegex.exec(line);
        const ol_li = olRegex.exec(line);

        // Either ul_li AND
        // There is no previousLine OR the previousLine is not a list item.
        // Repeat for ol_ul and olRegex
        const firstInList =
            (ul_li && (!previousLine || !ulRegex.exec(previousLine))) ||
            (ol_li && (!previousLine || !olRegex.exec(previousLine)));

        const lastInList =
            (ul_li && (!nextLine || !ulRegex.exec(nextLine))) ||
            (ol_li && (!nextLine || !olRegex.exec(nextLine)));

        (ul_li !== null || ol_li !== null) && wrappingTags.push("li");

        // Strip list item tokens from front.
        if (ul_li) {
            line = line.replace(ulRegex, '');
        } else if (ol_li) {
            line = line.replace(olRegex, '');
        }

        // Check for BlockQuote - TODO: Skip this if there is list stuff already.
        const blockQuote = blockQuoteRegex.exec(line);
        const firstBlockQuote =
            (blockQuote && (!previousLine || !blockQuoteRegex.exec(previousLine)))
        const lastBlockQuote =
            (blockQuote && (!nextLine || !blockQuoteRegex.exec(nextLine)))

        blockQuote && (line = line.replace(blockQuoteRegex, ''));

        // Check for H1-6 Tag
        // All List tag tokens should be stripped.
        // Only if the octothorpes are at the beginning of the line - after the list stuff - will
        // we append the H tag needed.

        const octothorpes = headingRegex.exec(line);
        const octothorpeString = octothorpes ? octothorpes[1] : null;

        (octothorpes && octothorpeString.length > 0 && octothorpeString.length <= 6) &&
            wrappingTags.push("h" + octothorpeString.length);

        // Make it a P tag if there aren't any tags yet.
        wrappingTags.length === 0 && wrappingTags.push("p");

        /* Inline Tags */

        // Match Bold first - otherwise you'll just have <em> tags around *this* stuff.
        let boldMatches = line.match(boldRegex);
        boldMatches && boldMatches.forEach((match) => {
            let htmlMatch = match.split('');
            htmlMatch.pop();    // Remove first *
            htmlMatch.shift();  // Remove last *
            htmlMatch[0] = "<strong>"; // Replace first *
            htmlMatch[htmlMatch.length - 1] = "</strong>"; // Replace last *
            line = line.replace(match, htmlMatch.join(''));
        })

        let emMatches = line.match(emRegex);
        emMatches && emMatches.forEach((match) => {
            let htmlMatch = match.split('');
            htmlMatch[0] = "<em>";
            htmlMatch[htmlMatch.length - 1] = "</em>";
            line = line.replace(match, htmlMatch.join(''));
        })


        // Images
        let imageMatch;
        while ((imageMatch = imageRegex.exec(line)) !== null) {
            line = line.replace(imageMatch[0], `<img src="${imageMatch[4]}" alt="${imageMatch[3]}" />`)
        }


        let namedImageMatch;
        while ((namedImageMatch = namedImageRegex.exec(line)) !== null) {
            console.log('here')
            console.log(namedImageMatch);
            line = line.replace(namedImageMatch[0], `<img src="${numberedLinks[namedImageMatch[2]].url}" alt="${namedImageMatch[1]}" />`)
        }

        // Checking links matching []() format
        let linkMatch;
        while ((linkMatch = linkRegex.exec(line)) !== null) {
            const text = linkMatch[3];
            const href = linkMatch[4];
            line = line.replace(linkMatch[0], `<a href="${href}">${text}</a>`)
        }

        // Checking links which are named elsewhere in the file [text][num]
        let namedLinkMatch;
        while ((namedLinkMatch = namedLinkRegex.exec(line)) !== null) {
            const text = namedLinkMatch[1];
            const index = namedLinkMatch[2].toLowerCase();
            const namedLink = numberedLinks[index];
            if (!namedLink) {
                console.log(`There is no link for ${index} - cannot convert ${namedLinkMatch[0]}`)
                continue;
            }
            line = line.replace(namedLinkMatch[0], `<a href="${namedLink.url}" title="${namedLink.title}">${text}</a>`)
        }




        let inlineCodeMatch;
        while ((inlineCodeMatch = inlineCodeRegex.exec(line)) !== null) {
            console.log("this ever gets here?")
            const fullMatch = inlineCodeMatch[0];
            const encodedText = htmlEncode(inlineCodeMatch[0].replace(/\`/g, ''));
            console.log(encodedText)
            line = line.replace(fullMatch, `<code>${encodedText}</code>`);
        }
        /* Time to Wrap it Up */

        // Strip heading tokens from front.
        (octothorpes && octothorpeString.length > 0 && octothorpeString.length <= 6) &&
            (line = line.replace(headingRegex, ''));

        // The wrappingTags should be applied in reverse order.
        wrappingTags.reverse().forEach((tag) => {
            line = ("<" + tag + ">" + line + "</" + tag + ">");
        })

        // If this is first/last in line - append the appropriate list tag
        firstInList &&  // Only true if this line is part of a list.
            (ul_li !== null ?     // It can only be one or the other (for now at least).
                line = "<ul>" + line :
                line = "<ol>" + line);

        lastInList &&
            (ul_li !== null ?
                line = line + "</ul>" :
                line = line + "</ol>");

        firstBlockQuote && (line = "<blockquote>" + line)
        lastBlockQuote && (line = line + "</blockquote>")

        output.push(line)
        return output;
    }, []);
    
    return outputHTML.join('');
}
/* to be moved elsewhere
document.addEventListener("DOMContentLoaded", () => {
    let inputElement = document.getElementById('mdjs-in').getElementsByTagName("textarea")[0];
    let outputElement = document.getElementById('mdjs-out');

    inputElement.addEventListener("input", (e) => {
        outputElement.innerHTML = parseMarkdownToHTML(e.target.value)
    })
});
*/

module.exports = { parseMarkdownToHTML, htmlEncode, parseForNamedUrls };