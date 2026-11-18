let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const productArea = document.getElementById("products");

function navigate(page) {
    document.querySelectorAll(".page").forEach(function(section) {
        section.classList.remove("active");
    });

    document.getElementById(page).classList.add("active");

    history.pushState({ page: page }, "", "#" + page);

    if (page === "cart") {
        showCart();
    }

    window.scrollTo(0, 0);
}

window.addEventListener("popstate", function() {
    let page = location.hash.substring(1) || "home";

    if (document.getElementById(page)) {
        document.querySelectorAll(".page").forEach(function(section) {
            section.classList.remove("active");
        });

        document.getElementById(page).classList.add("active");

        if (page === "cart") {
            showCart();
        }
    }
});

document.querySelectorAll(".nav-link").forEach(function(link) {
    link.addEventListener("click", function(event) {
        event.preventDefault();

        let page = link.getAttribute("href").substring(1);
        navigate(page);
    });
});

async function loadProducts() {
    try {
        let response = await fetch("products.json");

        if (!response.ok) {
            throw new Error("Unable to load products");
        }

        products = await response.json();

        showProducts(products);
    } catch (error) {
        productArea.innerHTML = "<p>Products could not be loaded. Please run Live Server.</p>";
        console.log(error);
    }
}

function showProducts(list) {
    productArea.innerHTML = "";

    if (list.length === 0) {
        productArea.innerHTML = "<p>No products found.</p>";
        return;
    }

    list.forEach(function(product) {
        let card = document.createElement("div");

        card.className = "product";

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Category: ${product.category}</p>
            <p>Price: ₹${product.price}</p>
            <button>Add to Cart</button>
        `;

        card.querySelector("button").addEventListener("click", function() {
            addToCart(product.id);
        });

        productArea.appendChild(card);
    });
}

function addToCart(id) {
    let item = cart.find(function(product) {
        return product.id === id;
    });

    if (item) {
        item.quantity++;
    } else {
        cart.push({
            id: id,
            quantity: 1
        });
    }

    saveCart();

    alert("Product added to cart");
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));

    document.getElementById("count").textContent =
        cart.reduce(function(total, item) {
            return total + item.quantity;
        }, 0);
}

function showCart() {
    let cartArea = document.getElementById("cartItems");
    let total = 0;

    cartArea.innerHTML = "";

    if (cart.length === 0) {
        cartArea.innerHTML = "<p>Your cart is empty.</p>";
    }

    cart.forEach(function(item) {
        let product = products.find(function(p) {
            return p.id === item.id;
        });

        if (!product) {
            return;
        }

        total += product.price * item.quantity;

        let row = document.createElement("div");
        row.className = "cart-item";

        row.innerHTML = `
            <div>
                <strong>${product.name}</strong>
                <p>₹${product.price} × ${item.quantity}</p>
            </div>
            <div>
                <button class="minus">-</button>
                <button class="plus">+</button>
                <button class="remove">Remove</button>
            </div>
        `;

        row.querySelector(".minus").addEventListener("click", function() {
            item.quantity--;

            if (item.quantity <= 0) {
                cart = cart.filter(function(p) {
                    return p.id !== item.id;
                });
            }

            saveCart();
            showCart();
        });

        row.querySelector(".plus").addEventListener("click", function() {
            item.quantity++;
            saveCart();
            showCart();
        });

        row.querySelector(".remove").addEventListener("click", function() {
            cart = cart.filter(function(p) {
                return p.id !== item.id;
            });

            saveCart();
            showCart();
        });

        cartArea.appendChild(row);
    });

    document.getElementById("total").textContent = total;
}

document.getElementById("search").addEventListener("input", function() {
    let value = this.value.toLowerCase();

    let filtered = products.filter(function(product) {
        return product.name.toLowerCase().includes(value);
    });

    showProducts(filtered);
});

document.getElementById("category").addEventListener("change", function() {
    let value = this.value;

    let filtered = products.filter(function(product) {
        return value === "All" || product.category === value;
    });

    showProducts(filtered);
});

document.getElementById("checkoutForm").addEventListener("submit", function(event) {
    event.preventDefault();

    if (cart.length === 0) {
        document.getElementById("message").textContent =
            "Please add products to your cart first.";
        return;
    }

    document.getElementById("message").textContent =
        "Demo order placed successfully! No real payment was made.";

    cart = [];

    saveCart();
    showCart();

    this.reset();
});

saveCart();

loadProducts();

let firstPage = location.hash.substring(1) || "home";

if (document.getElementById(firstPage)) {
    document.querySelectorAll(".page").forEach(function(section) {
        section.classList.remove("active");
    });

    document.getElementById(firstPage).classList.add("active");
}