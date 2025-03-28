import { productService } from "../apiService.js";
import { Product } from "../models.js";
import { formatCurrency } from "../customer/customer.js";

let allProducts = [];
let currentDeleteId = null;

// DOM Elements
const productModal = document.getElementById("product-modal");
const confirmModal = document.getElementById("confirm-modal");
const closeModalBtn = document.querySelector(".close-modal");
const addProductBtn = document.getElementById("add-product-btn");
const confirmDeleteBtn = document.getElementById("confirm-delete");

// Initialize event listeners
function initEventListeners() {
  addProductBtn.addEventListener("click", () => showProductForm());
  closeModalBtn.addEventListener("click", closeModal);
  confirmDeleteBtn.addEventListener("click", confirmDelete);
  document
    .getElementById("product-img")
    .addEventListener("input", updateImagePreview);
}

// Modal functions
function openModal() {
  productModal.style.display = "flex";
}

function closeModal() {
  productModal.style.display = "none";
  document.getElementById("product-form").reset();
}

function openConfirmModal(id) {
  currentDeleteId = id;
  confirmModal.style.display = "flex";
}

function closeConfirmModal() {
  confirmModal.style.display = "none";
  currentDeleteId = null;
}

function updateImagePreview() {
  const imgUrl = document.getElementById("product-img").value;
  const preview = document.getElementById("image-preview");
  if (imgUrl) {
    preview.src = imgUrl;
    preview.style.display = "block";
  } else {
    preview.style.display = "none";
  }
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
    renderAdminProducts(allProducts);
  } catch (error) {
    console.error("Failed to load products:", error);
    showToast("Không thể tải danh sách sản phẩm", "error");
  }
}

function renderAdminProducts(products) {
  const tableBody = document.querySelector("#admin-product-table tbody");
  tableBody.innerHTML = "";

  products.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${formatCurrency(product.price)}</td>
      <td>${product.type}</td>
      <td><img src="${product.img}" alt="${
      product.name
    }" class="product-thumbnail" onerror="this.src='../asset/img/placeholder.png'"></td>
      <td class="actions">
        <button class="btn btn-sm btn-primary" onclick="editProduct('${
          product.id
        }')">Sửa</button>
        <button class="btn btn-sm btn-danger" onclick="showDeleteConfirm('${
          product.id
        }')">Xóa</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

async function confirmDelete() {
  if (!currentDeleteId) return;

  try {
    await productService.delete(currentDeleteId);
    await getProducts();
    closeConfirmModal();
    showToast("Xóa sản phẩm thành công", "success");
  } catch (error) {
    console.error("Failed to delete product:", error);
    showToast("Xóa sản phẩm thất bại", "error");
  }
}

function showProductForm(product = null) {
  const modalTitle = document.getElementById("modal-title");

  if (product) {
    modalTitle.textContent = "Chỉnh sửa sản phẩm";
    document.getElementById("product-id").value = product.id;
    document.getElementById("product-name").value = product.name;
    document.getElementById("product-price").value = product.price;
    document.getElementById("product-type").value = product.type;
    document.getElementById("product-screen").value = product.screen;
    document.getElementById("product-backCamera").value = product.backCamera;
    document.getElementById("product-frontCamera").value = product.frontCamera;
    document.getElementById("product-img").value = product.img;
    document.getElementById("product-desc").value = product.desc;
    updateImagePreview();
  } else {
    modalTitle.textContent = "Thêm sản phẩm mới";
    document.getElementById("product-id").value = "";
    document.getElementById("product-form").reset();
    document.getElementById("image-preview").style.display = "none";
  }

  openModal();
}

async function saveProduct(event) {
  event.preventDefault();

  const id = document.getElementById("product-id").value;
  const formData = {
    name: document.getElementById("product-name").value.trim(),
    price: parseFloat(document.getElementById("product-price").value),
    type: document.getElementById("product-type").value,
    screen: document.getElementById("product-screen").value.trim(),
    backCamera: document.getElementById("product-backCamera").value.trim(),
    frontCamera: document.getElementById("product-frontCamera").value.trim(),
    img: document.getElementById("product-img").value.trim(),
    desc: document.getElementById("product-desc").value.trim(),
  };

  // Validation
  if (!formData.name || formData.name.length < 3) {
    showToast("Tên sản phẩm phải có ít nhất 3 ký tự", "error");
    return;
  }

  if (isNaN(formData.price)) {
    showToast("Giá sản phẩm phải là số", "error");
    return;
  }

  if (formData.price <= 0) {
    showToast("Giá sản phẩm phải lớn hơn 0", "error");
    return;
  }

  if (!formData.type) {
    showToast("Vui lòng chọn loại sản phẩm", "error");
    return;
  }

  try {
    if (id) {
      await productService.update(id, formData);
      showToast("Cập nhật sản phẩm thành công", "success");
    } else {
      await productService.create(formData);
      showToast("Thêm sản phẩm thành công", "success");
    }

    await getProducts();
    closeModal();
  } catch (error) {
    console.error("Failed to save product:", error);
    showToast("Lưu sản phẩm thất bại", "error");
  }
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

function searchProducts() {
  const searchTerm = document.getElementById("search-name").value.toLowerCase();
  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm)
  );
  renderAdminProducts(filtered);
}

function filterProducts() {
  const filterType = document.getElementById("filter-type").value;
  const filtered =
    filterType === "all"
      ? allProducts
      : allProducts.filter((p) => p.type === filterType);
  renderAdminProducts(filtered);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initEventListeners();
  getProducts();
});

// Make functions available globally
window.editProduct = async (id) => {
  try {
    const product = await productService.getById(id);
    showProductForm(
      new Product(
        product.id,
        product.name,
        product.price,
        product.screen,
        product.backCamera,
        product.frontCamera,
        product.img,
        product.desc,
        product.type
      )
    );
  } catch (error) {
    console.error("Failed to load product:", error);
    showToast("Không thể tải thông tin sản phẩm", "error");
  }
};

window.showDeleteConfirm = (id) => {
  openConfirmModal(id);
};

window.saveProduct = saveProduct;
window.searchProducts = searchProducts;
window.filterProducts = filterProducts;
window.closeConfirmModal = closeConfirmModal;
window.closeModal = closeModal;
