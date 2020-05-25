const fs = require("fs");
const path = require("path");

module.exports = class Cart {

    static addProduct(id, productPrice) {
        const p = path.join(path.dirname(process.mainModule.filename), "data", "cart.json")
        fs.readFile(p, (err, fileContent) => {
            let cart = {products: [], totalPrice: 0};
            if(!err && fileContent.length > 0) cart = JSON.parse(fileContent);
            const existingProductIndex = cart.products.findIndex(item => {
                return item.id === id;
            })
            if(existingProductIndex !== -1) {
                cart.products[existingProductIndex].qty += 1; 
                
            } else {
                let updatedProduct =  {id: id, qty: 1};
                cart.products.push(updatedProduct);
            }
            cart.totalPrice += +productPrice;
            fs.writeFile(p, JSON.stringify(cart), err => {
                if(err) console.log(err);
                console.log(cart); 
            }) 
        })      
    }

    static deleteProductIfExist(id, price, cb) {
        const p = path.join(path.dirname(process.mainModule.filename), "data", "cart.json")
        fs.readFile(p, (err, data) => {
            if(err) cb(true);
            let parsedCartData = {...JSON.parse(data)};
            const item = parsedCartData.products.find(item => item.id === id);
            console.log();
            if(item && item !== "undefined") {
                const updatedCartItems = parsedCartData.products.filter(item => item.id !== id);
                console.log( updatedCartItems);
                parsedCartData.products = updatedCartItems;         
                let remainingPrice = parsedCartData.totalPrice - price * item.qty;
                parsedCartData.totalPrice = remainingPrice;
                fs.writeFile(p, JSON.stringify(parsedCartData), err => {
                    if(err) throw err;
                    cb(false);
                }) 
            } else {
                cb(false);
            }
        })
    }

    static fetchProducts (cb) {
        const p = path.join(path.dirname(process.mainModule.filename), "data", "cart.json")
        fs.readFile(p, (err, data) => {
            if(err)  cb([]);
            let carts = JSON.parse(data);
           // console.log(carts);
            cb(carts); 
        })
    }
}