// ================= LOADER ================= 
window.addEventListener('load', function () {
  setTimeout(function () {
    document.getElementById('loader').classList.add('fade-out');
    document.getElementById('main-content').classList.remove('hidden');
    document.getElementById('main-content').classList.add('show');
  }, 1500); 
});

document.addEventListener('DOMContentLoaded', function () {

  // Menu Toggle
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

  // Cart Toggle
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

  // Upsell Close
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
            <div style="flex: 1;">
              <strong>${name}</strong><br>
              <strong style="color: var(--saffron);">₹${subtotal}</strong>
            </div>
            <div class="cart-qty-control">
              <button class="cart-qty-btn cart-minus" data-name="${name}">−</button>
              <span style="font-weight: bold; width: 16px; text-align: center;">${item.quantity}</span>
              <button class="cart-qty-btn cart-plus" data-name="${name}">+</button>
            </div>
          </div>
        `;
      });
    }

    cartCount.textContent = totalItems;
    cartTotal.textContent = `₹${totalAmountGlobal}`;

    document.querySelectorAll('.cart-plus').forEach(btn => {
      btn.addEventListener('click', function() {
        const name = this.dataset.name;
        cart[name].quantity++;
        syncMenuUI(name, cart[name].quantity);
        updateCartUI();
      });
    });

    document.querySelectorAll('.cart-minus').forEach(btn => {
      btn.addEventListener('click', function() {
        const name = this.dataset.name;
        if (cart[name].quantity > 1) {
          cart[name].quantity--;
          syncMenuUI(name, cart[name].quantity);
        } else {
          delete cart[name];
          syncMenuUI(name, 0); 
        }
        updateCartUI();
      });
    });
  }

  // Menu +/- Buttons
  document.querySelectorAll('.quantity-control').forEach(control => {
    const name = control.dataset.name;
    const price = parseInt(control.dataset.price, 10);
    const qtyValue = control.querySelector('.qty-value');

    control.querySelector('.plus').addEventListener('click', () => {
      cart[name] = cart[name] ? { price, quantity: cart[name].quantity + 1 } : { price, quantity: 1 };
      qtyValue.textContent = cart[name].quantity;
      updateCartUI();
    });

    control.querySelector('.minus').addEventListener('click', () => {
      if (cart[name] && cart[name].quantity > 0) {
        cart[name].quantity--;
        qtyValue.textContent = cart[name].quantity;
        if (cart[name].quantity === 0) delete cart[name];
        updateCartUI();
      }
    });
  });

  // Upsell Click
  document.querySelectorAll('.upsell-item').forEach(btn => {
    btn.addEventListener('click', function () {
      const name = this.dataset.name;
      const price = parseInt(this.dataset.price, 10);
      cart[name] = cart[name] ? { price, quantity: cart[name].quantity + 1 } : { price, quantity: 1 };
      updateCartUI();
      
      this.style.background = 'rgba(230, 126, 34, 0.15)';
      setTimeout(() => this.style.background = '', 300);
    });
  });

  // Order Type Logic
  const orderRadios = document.querySelectorAll('input[name="orderType"]');
  const addressBox = document.getElementById('addressBox');

  orderRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if(e.target.value === 'Home Delivery') {
        addressBox.style.display = 'block';
      } else {
        addressBox.style.display = 'none';
      }
    });
  });

  // WhatsApp Sender
  document.getElementById('whatsappOrderBtn').addEventListener('click', function () {
    if (Object.keys(cart).length === 0) {
      alert("Sir, your cart is empty! Please add some dishes.");
      return;
    }

    const selectedOrderType = document.querySelector('input[name="orderType"]:checked').value;
    const address = document.getElementById('deliveryAddress').value.trim();

    let message = `🍽️ *Hotel Paradise Order*\n\n`;
    message += `📦 *Order Type:* ${selectedOrderType}\n`;

    if (selectedOrderType === 'Home Delivery') {
      if (address === '') { alert("Please enter your Delivery Address!"); return; }
      message += `📍 *Address:* ${address}\n`;
    }

    message += `\n*Items:*\n`;
    Object.keys(cart).forEach(name => {
      const item = cart[name];
      message += `• ${name} x${item.quantity} = ₹${item.price * item.quantity}\n`;
    });

    message += `\n💰 *Total Bill: ₹${totalAmountGlobal}*`;

    const WHATSAPP_NUMBER = '919876543210'; 
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  });

});
