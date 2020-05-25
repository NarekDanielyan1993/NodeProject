const fs = require("fs");

const handleRequests = (req, res) => {

    const url = req.url;
    const method = req.method;
    if("/" === url) {
        res.write("<html><header><title></title></header><body>");
        res.write("<form action='/create-users' method='POST'><input type='text' name='users'/><submit type='button'>button</submit></form>");
        res.write("</body></html>");
        return res.end();
    }

    if("/create-users" === url && "POST" === method ) {
        const body = [];
        req.on("data", chunk => {
            body.push(chunk);
        })
        return req.on("end", () => {
            const parseBody = Buffer.concat(body).toString();
            const data = parseBody.split("=");
            fs.writeFile("text.txt", data, (err) => {
                res.setHeader("Location", "/");
                res.statusCode = 302;
                console.log(parseBody);    
                return res.end();
            })
            
          
        })
       
    }
    if("/user" === url) {
        res.write("<html><header><title></title></header><body>");
        res.write("<ul><li>user 1</li></ul>")
        res.write("</body></html>");
        return res.end();
    }

}

module.exports = handleRequests;