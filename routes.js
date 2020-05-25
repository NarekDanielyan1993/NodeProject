const fs = require("fs");

const handleRequests = (req, res) => {
    const url = req.url;
    const method = req.method;
    console.log(method);
    console.log(url);
    if("/" === url) {
        res.write("<html><head><title>message</title> </head>");
        res.write('<body><form action="/message" method="POST"><input type="text" name="message"/></form></body></html>');
        return res.end();
    }
    if('/message' === url && method === 'POST') {
        const params = [];
        req.on("data", (chunk) => {
            params.push(chunk);
        })
        return req.on("end", () => {
          const parseBody = Buffer.concat(params).toString();
          const mess = parseBody.split("=");
          fs.writeFile("text.txt", mess, (err) => {
            if(err) res.write(err);
            res.setHeader("Location", "/");
            res.statusCode = 302;
            return res.end();
          });
          console.log(parseBody);
        })
        
        return res.end();
    }
    res.setHeader("Content-Type", "text/html");
}

module.exports = handleRequests;

//another way of export: exports.handler = handleRequests