const deleteProduct = (btn) => {
    const srfc = btn.parentNode.querySelector('input[name="_csrf"]').value
    const productId = btn.parentNode.querySelector('input[name="productId"]').value
    const article = btn.closest("article");
    fetch("/admin/delete-product/"+productId, {
        method: "DELETE",
        headers: {
            "csrf-token": srfc
        }
    })
    .then((response) => {
        console.log(response)
        article.parentNode.removeChild(article)
    }).catch((err) => {
        console.log(err)
    });
}