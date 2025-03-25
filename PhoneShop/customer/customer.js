import { API_BASE_URL } from "../constants.js";
import { Product, CartItem } from "../models.js";
import { productService } from "../apiService.js";

let allProducts = [];
let cart = [];

// DOM Elements
const cartLink = document.getElementById("cart-link");
const cartSidebar = document.getElementById("cart-sidebar");
const closeCartBtn = document.querySelector(".close-cart");
const productModal = document.getElementById("product-modal");
const closeModalBtn = document.querySelector(".close-modal");

// Initialize event listeners
function initEventListeners() {
  cartLink.addEventListener("click", toggleCart);
  closeCartBtn.addEventListener("click", toggleCart);
  closeModalBtn.addEventListener("click", closeModal);
  document.getElementById("close-modal").addEventListener("click", closeModal);
  document
    .getElementById("add-to-cart-modal")
    .addEventListener("click", addFromModal);
}

// Toggle cart sidebar
function toggleCart() {
  cartSidebar.classList.toggle("active");
}

// Search products
function searchProducts() {
  const searchTerm = document.getElementById("search-name").value.toLowerCase();
  const filtered = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.desc.toLowerCase().includes(searchTerm)
  );
  renderProducts(filtered);
}

// Modal functions
function openModal(product) {
  document.getElementById("modal-product-image").src = product.img;
  document.getElementById("modal-product-name").textContent = product.name;
  document.getElementById("modal-product-price").textContent = formatCurrency(
    product.price
  );
  document.getElementById("modal-product-desc").textContent = product.desc;

  // Render product specs
  const specsList = document.getElementById("product-specs");
  specsList.innerHTML = `
    <li>Màn hình: ${product.screen}</li>
    <li>Camera sau: ${product.backCamera}</li>
    <li>Camera trước: ${product.frontCamera}</li>
    <li>Loại: ${product.type}</li>
  `;

  document.getElementById("add-to-cart-modal").dataset.productId = product.id;
  productModal.style.display = "flex";
}

function closeModal() {
  productModal.style.display = "none";
}

// Add to cart from modal
function addFromModal() {
  const productId = this.dataset.productId;
  addToCart(productId);
  closeModal();
}

async function getProducts() {
  try {
    const products = await productService.getAll();
    allProducts = products.map(
      (p) =>
        new Product(
          p.id,
          p.name,
          p.price,
          p.screen,
          p.backCamera,
          p.frontCamera,
          p.img,
          p.desc,
          p.type
        )
    );
    renderProducts(allProducts);
    loadCart();
    initEventListeners();
  } catch (error) {
    console.error("Failed to load products:", error);
    alert("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
  }
}

function renderProducts(products) {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <div class="product-image">
        <img src="${product.img}" alt="${
      product.name
    }" onerror="this.src='../asset/img/placeholder.png'">
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${formatCurrency(product.price)}</p>
        <div class="product-actions">
          <button class="btn btn-primary quick-add" data-id="${product.id}">
            Thêm vào giỏ
          </button>
          <button class="btn btn-secondary" onclick="openModalDetails('${
            product.id
          }')">
            Chi tiết
          </button>
        </div>
      </div>
    `;
    productList.appendChild(productCard);
  });

  // Add quick add event listeners
  document.querySelectorAll(".quick-add").forEach((btn) => {
    btn.addEventListener("click", function () {
      addToCart(this.dataset.id);
      showToast("Đã thêm vào giỏ hàng", "success");
    });
  });
}

function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function openModalDetails(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (product) openModal(product);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function filterProducts() {
  const type = document.getElementById("filter-type").value;
  const filtered =
    type === "all" ? allProducts : allProducts.filter((p) => p.type === type);
  renderProducts(filtered);
}

function addToCart(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.product.id === productId);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push(new CartItem(product));
  }

  updateCartCount();
  renderCart();
  saveCart();
}

function renderCart() {
  const cartTableBody = document.querySelector("#cart-table tbody");
  cartTableBody.innerHTML = "";

  let total = 0;
  cart.forEach((item, index) => {
    const row = document.createElement("tr");
    const itemTotal = item.product.price * item.quantity;
    total += itemTotal;

    row.innerHTML = `
      <td>${item.product.name}</td>
      <td>${formatCurrency(item.product.price)}</td>
      <td>
        <button class="btn btn-sm" onclick="changeQuantity(${index}, -1)">-</button>
        ${item.quantity}
        <button class="btn btn-sm" onclick="changeQuantity(${index}, 1)">+</button>
      </td>
      <td>${formatCurrency(itemTotal)}</td>
      <td><button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Xóa</button></td>
    `;
    cartTableBody.appendChild(row);
  });

  document.getElementById("total-price").textContent = formatCurrency(total);
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cart-count").textContent = totalItems;
}

function changeQuantity(index, delta) {
  const item = cart[index];
  item.quantity += delta;

  if (item.quantity < 1) {
    cart.splice(index, 1);
  }

  updateCartCount();
  renderCart();
  saveCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartCount();
  renderCart();
  saveCart();
}

function checkout() {
  if (cart.length === 0) {
    showToast("Giỏ hàng trống!", "error");
    return;
  }

  if (confirm("Xác nhận thanh toán?")) {
    cart = [];
    updateCartCount();
    renderCart();
    saveCart();
    showToast("Cảm ơn bạn đã mua hàng!", "success");
    toggleCart();
  }
}

function saveCart() {
  localStorage.setItem(
    "cart",
    JSON.stringify(
      cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }))
    )
  );
}

function loadCart() {
  const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = savedCart
    .map((item) => {
      const product = allProducts.find((p) => p.id === item.productId);
      return product ? new CartItem(product, item.quantity) : null;
    })
    .filter(Boolean);

  updateCartCount();
  renderCart();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  getProducts();
});

// Make functions available globally
window.filterProducts = filterProducts;
window.searchProducts = searchProducts;
window.addToCart = addToCart;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.checkout = checkout;
window.openModalDetails = openModalDetails;
