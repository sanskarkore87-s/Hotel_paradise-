// ================= LOADER ================= 
window.addEventListener('load', function () {
  setTimeout(function () {
    document.getElementById('loader').classList.add('fade-out');
    document.getElementById('main-content').classList.remove('hidden');
    document.getElementById('main-content').classList.add('show');
  }, 1500); 
});

document.addEventListener('DOMContentLoaded', function () {

  // ================= ORDER ID =================
  function generateOrderId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "HP-";
    for (let i = 0; i < 6; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  }

  let currentOrderId = generateOrderId();

  // ================= MENU =================
  const menuDrawer = document.getElementById('menuDrawer');
  const menuOverlay = document.getElementById('menuOverlay');

  function toggleMenu(show) {
    menuDrawer.classList.toggle('active', show);
    menuOverlay.classList.toggle('active', show);
    document.body.style.overflow = show ? 'hidden' : '';
  }

  document.getElementById('openMenuBtn').addEventListener('click', () => toggleMenu(true));
  document.getElementById('openMenuNav').addEventListener('click', () => toggleMenu(true));
  document.getElementById('closeMenuBtn').addEventListener('click', () => toggleMenu(false));
  menuOverlay.addEventListener('click', () => toggleMenu(false));

  // ================= CART =================
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');

  function toggleCart(show) {
    cartDrawer.classList.toggle('active', show);
    cartOverlay.classList.toggle('active', show);
    document.body.style.overflow = show ? 'hidden' : '';
  }

  document.getElementById('cartButton').addEventListener('click', () => toggleCart(true));
  document.getElementById('closeCartBtn').addEventListener('click', () => toggleCart(false));
  cartOverlay.addEventListener('click', () => toggleCart(false));

  document.getElementById('closeUpsellBtn').addEventListener('click', () => {
    document.getElementById('upsellBox').style.display = 'none';
  });

  // ================= CART LOGIC =================
  let cart = {};
  const cartCount = document.getElementById('cartCount');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  let totalAmountGlobal = 0;

  function syncMenuUI(itemName, newQty) {
    const control = document.querySelector(`.quantity-control[data-name="${itemName}"]`);
    if (control) control.querySelector('.qty-value').textContent = newQty;
  }

  function updateCartUI() {
    let totalItems = 0;
    totalAmountGlobal = 0;
    cartItems.innerHTML = '';

    const keys = Object.keys(cart);

    if (keys.length === 0) {
      cartItems.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    } else {
      keys.forEach(name => {
        const item = cart[name];
        const subtotal = item.price * item.quantity;

        totalItems += item.quantity;
        totalAmountGlobal += subtotal;

        cartItems.innerHTML += `
          <div class="cart-item-row">
            <div>
              <strong>${name}</strong><br>
              <strong style="color: var(--saffron);">₹${subtotal}</strong>
            </div>
            <div class="cart-qty-control">
              <button class="cart-qty-btn cart-minus" data-name="${name}">−</button>
              <span>${item.quantity}</span>
              <button class="cart-qty-btn cart-plus" data-name="${name}">+</button>
            </div>
          </div>
        `;
      });
    }

    cartCount.textContent = totalItems;
    cartTotal.textContent = `₹${totalAmountGlobal}`;

    document.querySelectorAll('.cart-plus').forEach(btn => {
      btn.addEventListener('click', function () {
        const name = this.dataset.name;
        cart[name].quantity++;
        syncMenuUI(name, cart[name].quantity);
        updateCartUI();
      });
    });

    document.querySelectorAll('.cart-minus').forEach(btn => {
      btn.addEventListener('click', function () {
        const name = this.dataset.name;
        if (cart[name].quantity > 1) {
          cart[name].quantity--;
        } else {
          delete cart[name];
          syncMenuUI(name, 0);
        }
        updateCartUI();
      });
    });
  }

  // ================= MENU BUTTONS =================
  document.querySelectorAll('.quantity-control').forEach(control => {
    const name = control.dataset.name;
    const price = parseInt(control.dataset.price);
    const qtyValue = control.querySelector('.qty-value');

    control.querySelector('.plus').addEventListener('click', () => {
      cart[name] = cart[name]
        ? { price, quantity: cart[name].quantity + 1 }
        : { price, quantity: 1 };

      qtyValue.textContent = cart[name].quantity;
      updateCartUI();
    });

    control.querySelector('.minus').addEventListener('click', () => {
      if (cart[name]) {
        cart[name].quantity--;
        if (cart[name].quantity <= 0) {
          delete cart[name];
          qtyValue.textContent = 0;
        } else {
          qtyValue.textContent = cart[name].quantity;
        }
        updateCartUI();
      }
    });
  });

  // ================= UPSELL =================
  document.querySelectorAll('.upsell-item').forEach(btn => {
    btn.addEventListener('click', function () {
      const name = this.dataset.name;
      const price = parseInt(this.dataset.price);

      cart[name] = cart[name]
        ? { price, quantity: cart[name].quantity + 1 }
        : { price, quantity: 1 };

      updateCartUI();
    });
  });

  // ================= ORDER TYPE =================
  const orderRadios = document.querySelectorAll('input[name="orderType"]');
  const addressBox = document.getElementById('addressBox');

  orderRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      addressBox.style.display = e.target.value === 'Home Delivery' ? 'block' : 'none';
    });
  });

  // ================= CHECKOUT MODAL =================
  const modal = document.getElementById('checkoutModal');

  document.getElementById('whatsappOrderBtn').addEventListener('click', function () {
    if (Object.keys(cart).length === 0) {
      alert("Cart is empty!");
      return;
    }
    modal.classList.add('active');
  });

  // ================= FINAL WHATSAPP =================
  document.getElementById('confirmOrderBtn').addEventListener('click', function () {

    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();

    if (!name || !phone) {
      alert("Enter Name & Phone");
      return;
    }

    const orderType = document.querySelector('input[name="orderType"]:checked').value;
    const address = document.getElementById('deliveryAddress').value.trim();

    let message = `🍽️ *Hotel Paradise Order*\n\n`;
    message += `🆔 Order ID: ${currentOrderId}\n`;
    message += `👤 Name: ${name}\n`;
    message += `📱 Phone: ${phone}\n`;
    message += `📦 Type: ${orderType}\n`;

    if (orderType === 'Home Delivery') {
      if (!address) {
        alert("Enter address");
        return;
      }
      message += `📍 Address: ${address}\n`;
    }

    message += `\n*Items:*\n`;

    Object.keys(cart).forEach(nameItem => {
      const item = cart[nameItem];
      message += `• ${nameItem} x${item.quantity} = ₹${item.price * item.quantity}\n`;
    });

    message += `\n💰 Total: ₹${totalAmountGlobal}`;

    const number = "919372549949";

    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank');

    modal.classList.remove('active');
  });

});