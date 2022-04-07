# iXBRL Bookmarklet

A “bookmarklet” is a browser bookmark that adds extra functionalities to the browser when it’s clicked. In this particular case, it will create an extra table to display XBRL related information about the document you are visualizing. It’s important to mention that any behaviour added by this, won’t affect permanently your browser or document, and will be lost when you change to another page (or even if you refresh it).

## How to create a bookmarklet ?

Just create a new bookmark in your browser and copy the code stored in the file named `iXBRL-bookmarklet-one-line.js` into the URL section.

## How to use it ?

When you are visualizing an iXBRL file (which is a HTML file) in your Browser, run the bookmark you have created. Now, while navigating over your iXBRL document, when you hover over any item that contains a XBRL tag, a table with related information should appear.

Note that only element that are visible in the iXBRL file will be displayed, since you need to hover them. If there are xbrl tags that are hidden and not displayed anywhere in the file, you won't be able to reach them and display the information table.

## How to contribute ?

Do you want to make your own changes to the bookmarklet? That's great! The entire logic to make this bookmarklet work is stored in the file named `iXBRL-bookmarklet-code.js`. You can work on that one and make all the changes you need.
Then, you can run the `node createBookmarklet.js` to convert the previous file into a one-line JavaScript code, that can be easily copy-pasted into a bookmark (running `node createBookmarklet.js` will overwrite your existing `iXBRL-bookmarklet-one-line.js` file).
Don't forget to submit your updates or fixes vía a Pull Request.

## Disclaimer

This bookmarklet was created as a tool to help us debug, and easily inspect the content, of our own iXBRL exports. It may not work correctly with HTML files that are structured differently.