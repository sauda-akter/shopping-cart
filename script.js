let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCart = document.querySelector('.icon-cart');
let iconCartSpan = document.querySelector('.icon-cart span');
let body = document.querySelector('body');
let closeCart = document.querySelector('.close');
let products = [];
let cart = [];
let promoApplied = false;
let discountRate = 0;

const resetPromo = () => {
    promoApplied = false;
    discountRate = 0;
    document.getElementById('promoCodeInput').value = "";
    document.getElementById('promoMessage').innerText = "";
};

iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});
closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});

const addDataToHTML = () => {
    if(products.length > 0) // if has data
    {
        products.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.dataset.id = product.id;
            newProduct.classList.add('item');
            newProduct.innerHTML = 
            `<img src="${product.image}" alt="">
            <h2>${product.name}</h2>
            <div class="description">${product.description}</div><br>
            <div class="price">$${product.price}</div>
            <button class="addCart">Add To Cart</button>`;
            listProductHTML.appendChild(newProduct);
        });
    }
};

listProductHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if(positionClick.classList.contains('addCart')){
        let id_product = positionClick.parentElement.dataset.id;
        addToCart(id_product);
    }
});

const addToCart = (product_id) => {
    let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);
    if(cart.length <= 0){
        cart = [{
            product_id: product_id,
            quantity: 1
        }];
    }else if(positionThisProductInCart < 0){
        cart.push({
            product_id: product_id,
            quantity: 1
        });
    }else{
        cart[positionThisProductInCart].quantity = cart[positionThisProductInCart].quantity + 1;
    }
    addCartToHTML();
    addCartToMemory();
};

const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
};

const updateTotalPrice = () => {
    let subtotal = 0;
    cart.forEach(item => {
        let product = products.find(p => p.id == item.product_id);
        if (product) {
            subtotal += product.price * item.quantity;
        }
    });
    let finalTotal = subtotal * (1 - discountRate);
    if (finalTotal < 0) finalTotal = 0;
    document.querySelector('.total-price').innerText = `$${finalTotal.toFixed(2)}`;
};


const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    if(cart.length > 0){
        cart.forEach(item => {
            totalQuantity += item.quantity;
            let newItem = document.createElement('div');
            newItem.classList.add('item');
            newItem.dataset.id = item.product_id;

            let positionProduct = products.findIndex((value) => value.id == item.product_id);
            let info = products[positionProduct];
            newItem.innerHTML = `
            <div class="image">
                <img src="${info.image}">
            </div>
            <div class="name">
            ${info.name}
            </div>
            <div class="totalPrice">$${(info.price * item.quantity).toFixed(2)}</div>
            <div class="quantity">
                <span class="minus">-</span>
                <span>${item.quantity}</span>
                <span class="plus">+</span>
            </div><br>
            `;
            listCartHTML.appendChild(newItem);
        });
    }
    iconCartSpan.innerText = totalQuantity;
    updateTotalPrice();
};

listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if(positionClick.classList.contains('minus') || positionClick.classList.contains('plus')){
        let product_id = positionClick.parentElement.parentElement.dataset.id;
        let type = 'minus';
        if(positionClick.classList.contains('plus')){
            type = 'plus';
        }
        changeQuantityCart(product_id, type);
    }
});

const changeQuantityCart = (product_id, type) => {
    let positionItemInCart = cart.findIndex((value) => value.product_id == product_id);
    if(positionItemInCart >= 0){
        let info = cart[positionItemInCart];
        switch (type) {
            case 'plus':
                cart[positionItemInCart].quantity = cart[positionItemInCart].quantity + 1;
                break;
            default:
                let changeQuantity = cart[positionItemInCart].quantity - 1;
                if (changeQuantity > 0) {
                    cart[positionItemInCart].quantity = changeQuantity;
                }else{
                    cart.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    addCartToHTML();
    addCartToMemory();
};

const initApp = () => {
    fetch('products.json')
    .then(response => response.json())
    .then(data => {
        products = data;
        addDataToHTML();

        if(localStorage.getItem('cart')){
            cart = JSON.parse(localStorage.getItem('cart'));
            addCartToHTML();
        }
    })
};
initApp();


const applyPromo = () => {
    if (promoApplied) {
        document.getElementById('promoMessage').innerText = "Promo code already applied!";
        return;
    }
    else {
    alert("Invalid Promo Code!");
    document.getElementById('promoMessage').innerText = "Invalid Promo Code";
    discountRate = 0;
    }

    let code = document.getElementById('promoCodeInput').value.trim().toLowerCase();
    if (code === "ostad10") {
        discountRate = 0.10;
        promoApplied = true;
        document.getElementById('promoMessage').innerText = "10% discount applied!";
    } 
    else if (code === "ostad50") {
        discountRate = 0.50;
        promoApplied = true;
        document.getElementById('promoMessage').innerText = "50% discount applied!";
    } 
    else {
        document.getElementById('promoMessage').innerText = "Invalid Promo Code";
        discountRate = 0;
    }
    updateTotalPrice();
};

document.getElementById('applyPromoBtn').addEventListener('click', applyPromo);

document.querySelector('.checkOut').addEventListener('click', () => {
    alert("Order placed successfully!");
    cart = [];
    addCartToMemory();
    addCartToHTML();
    resetPromo();
});