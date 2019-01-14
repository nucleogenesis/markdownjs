const {parseMarkdownToHTML, htmlEncode, parseForNamedUrls } = require('../index');
console.log(htmlEncode)

const htmlEncodingTests = [
    {original: "<", expected: "&#60;"},
    {original: "<html></html>", expected: "&#60;html&#62;&#60;/html&#62;"}
]
htmlEncodingTests.forEach((testObject) => {
    test(`htmlEncode should encode ${testObject.original} to ${testObject.expected}`, () => {
        expect(htmlEncode(testObject.original)).toBe(testObject.expected);
    })
});