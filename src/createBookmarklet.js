fs = require ('fs');

fs.readFile('./iXBRL-bookmarklet-code.js', 'utf-8', function (err, data) {
    if (err) {
        return console.log(err); // Handle error while opening file
    }

    data = data.replace(/(\r\n|\n|\r)/gm, "");
    output = "javascript: (() => {"+data+"})();";
    
    fs.writeFile('./iXBRL-bookmarklet-one-line.js', output, function (err) {
        if (err) {
            return console.log(err); // Handle error while writing file
        }
        console.log("File saved.")
    })
} )
