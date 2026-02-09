document.addEventListener('DOMContentLoaded', () => {

    // --- Hamburger Menu Logic ---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-links');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-links a').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }

    // --- Shopping Cart Logic ---
    const cartLink = document.getElementById('cart-link');
    const cartCountElement = document.getElementById('cart-count');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const clearCartBtn = document.getElementById('clear-cart-btn');

    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    if (!Array.isArray(cartItems)) cartItems = [];

    updateCartBadge();

    function toggleCart() {
        if (cartSidebar) {
            cartSidebar.classList.toggle('active');
            cartOverlay.classList.toggle('active');
            if (cartSidebar.classList.contains('active')) {
                renderCartItems();
            }
        }
    }

    if (cartLink) cartLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleCart();
    });

    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    if (clearCartBtn) clearCartBtn.addEventListener('click', () => {
        cartItems = [];
        saveCart();
        renderCartItems();
    });

    function saveCart() {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        updateCartBadge();
    }

    function updateCartBadge() {
        if (cartCountElement) {
            cartCountElement.textContent = cartItems.length;
        }
    }

    function renderCartItems() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        let total = 0;
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Tu carrito está vacío.</p>';
        } else {
            cartItems.forEach((item, index) => {
                total += item.price;
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <img src="${item.image}" alt="${item.model}">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.model}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    </div>
                    <button class="remove-item-btn" data-index="${index}">&times;</button>
                `;
                cartItemsContainer.appendChild(div);
            });
            document.querySelectorAll('.remove-item-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    cartItems.splice(index, 1);
                    saveCart();
                    renderCartItems();
                });
            });
        }
        if (cartTotalPrice) cartTotalPrice.textContent = `$${total.toFixed(2)}`;
    }

    // --- Carousel Data Management ---
    const CAROUSEL_STORAGE_KEY = 'carouselImages';
    const DEFAULT_CAROUSEL = [
        "https://res.cloudinary.com/dqm0z6vsk/image/upload/v1715456345/nike-banner1.jpg",
        "https://res.cloudinary.com/dqm0z6vsk/image/upload/v1715456345/nike-banner2.jpg"
    ];

    function getCarouselImages() {
        const stored = localStorage.getItem(CAROUSEL_STORAGE_KEY);
        let images = stored ? JSON.parse(stored) : [];
        if (images.length === 0) return DEFAULT_CAROUSEL;
        return images;
    }

    function saveCarouselImages(images) {
        localStorage.setItem(CAROUSEL_STORAGE_KEY, JSON.stringify(images));
    }

    const adminGallery = document.getElementById('admin-gallery');
    const imageUrlInput = document.getElementById('image-url-input');
    const addImageBtn = document.getElementById('add-image-btn');

    if (adminGallery) {
        renderAdminGallery();
        if (addImageBtn && imageUrlInput) {
            addImageBtn.addEventListener('click', () => {
                const url = imageUrlInput.value.trim();
                if (url) {
                    const images = getCarouselImages();
                    images.push(url);
                    saveCarouselImages(images);
                    renderAdminGallery();
                    imageUrlInput.value = '';
                }
            });
        }
    }

    function renderAdminGallery() {
        if (!adminGallery) return;
        adminGallery.innerHTML = '';
        const images = getCarouselImages();
        images.forEach((url, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `
                <img src="${url}" alt="Carousel Image">
                <button class="delete-btn" data-index="${index}">X</button>
            `;
            adminGallery.appendChild(item);
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                const images = getCarouselImages();
                images.splice(index, 1);
                saveCarouselImages(images);
                renderAdminGallery();
            });
        });
    }

    const carouselWrapper = document.getElementById('carousel-wrapper');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    let currentIndex = 0;
    let autoPlayInterval;

    const imagesToRender = getCarouselImages();
    if (carouselWrapper && imagesToRender.length > 0) {
        initCarousel();
    }

    function initCarousel() {
        const images = getCarouselImages();
        carouselWrapper.innerHTML = '';
        images.forEach(url => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `<img src="${url}" alt="Slide">`;
            carouselWrapper.appendChild(slide);
        });
        if (prevBtn) prevBtn.addEventListener('click', () => { moveCarousel(-1); resetAutoPlay(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { moveCarousel(1); resetAutoPlay(); });
        startAutoPlay();
    }

    function moveCarousel(direction) {
        const slides = document.querySelectorAll('.carousel-slide');
        if (slides.length === 0) return;
        currentIndex = (currentIndex + direction + slides.length) % slides.length;
        carouselWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function startAutoPlay() { autoPlayInterval = setInterval(() => moveCarousel(1), 3000); }
    function resetAutoPlay() { clearInterval(autoPlayInterval); startAutoPlay(); }

    // --- Product Management Logic ---
    const PRODUCT_STORAGE_KEY = 'products';
    const DEFAULT_PRODUCTS = [
        { id: 1, model: "Nike Air Max", price: 150.00, image: "https://res.cloudinary.com/dqm0z6vsk/image/upload/v1715456345/nike1.jpg", inStock: true },
        { id: 2, model: "Adidas Ultraboost", price: 180.00, image: "https://res.cloudinary.com/dqm0z6vsk/image/upload/v1715456345/nike2.jpg", inStock: true },
        { id: 3, model: "Puma Cali", price: 90.00, image: "https://res.cloudinary.com/dqm0z6vsk/image/upload/v1715456345/nike3.jpg", inStock: true }
    ];

    const productGrid = document.getElementById('product-grid');
    const adminProductList = document.getElementById('admin-product-list');

    function getProducts() {
        const stored = localStorage.getItem(PRODUCT_STORAGE_KEY);
        let products = stored ? JSON.parse(stored) : [];
        if (products.length === 0) return DEFAULT_PRODUCTS;
        return products;
    }

    function saveProducts(products) {
        localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
    }

    if (adminProductList) {
        renderAdminProducts();
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                const image = document.getElementById('prod-image').value.trim();
                const model = document.getElementById('prod-model').value.trim();
                const price = parseFloat(document.getElementById('prod-price').value);
                if (image && model && price) {
                    const products = getProducts();
                    products.push({ id: Date.now(), image, model, price, inStock: true });
                    saveProducts(products);
                    renderAdminProducts();
                    alert('Producto agregado!');
                }
            });
        }
    }

    function renderAdminProducts() {
        if (!adminProductList) return;
        adminProductList.innerHTML = '';
        const products = getProducts();
        products.forEach((prod, index) => {
            const item = document.createElement('div');
            item.className = 'admin-product-item';
            item.innerHTML = `
                <div class="admin-product-info">
                    <img src="${prod.image}" alt="${prod.model}">
                    <div><strong>${prod.model}</strong><br>$${prod.price.toFixed(2)}</div>
                </div>
                <button class="admin-delete-prod-btn" data-index="${index}">Eliminar</button>
            `;
            adminProductList.appendChild(item);
        });
        document.querySelectorAll('.admin-delete-prod-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                const products = getProducts();
                products.splice(index, 1);
                saveProducts(products);
                renderAdminProducts();
            });
        });
    }

    if (productGrid) renderProductGrid();

    function renderProductGrid() {
        if (!productGrid) return;
        const products = getProducts();
        productGrid.innerHTML = '';
        if (products.length === 0) {
            productGrid.innerHTML = '<p class="placeholder-text">No hay productos disponibles.</p>';
            return;
        }
        products.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${prod.image}" alt="${prod.model}">
                <h3>${prod.model}</h3>
                <div class="price-container">$${prod.price.toFixed(2)}</div>
                <button class="add-to-cart-btn">Agregar</button>
            `;
            productGrid.appendChild(card);
        });

        // Add to cart functionality
        document.querySelectorAll('.add-to-cart-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const products = getProducts();
                cartItems.push(products[index]);
                saveCart();
                renderCartItems();
                alert(`${products[index].model} agregado al carrito!`);
            });
        });
    }

});
