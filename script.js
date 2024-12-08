let deliveries = []; // Array to track all deliveries
let currentProducts = []; // Array for products of the current delivery
let deliveryCounter = 1; // Counter for numbering deliveries
let editingDeliveryIndex = null; // Track the index of the delivery being edited

// Load data from JSON files
async function loadData() {
  try {
    const customers = await fetch('customers.json').then(res => res.json());
    const products = await fetch('products.json').then(res => res.json());

    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('products', JSON.stringify(products));

    populateReels(customers, products);
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Populate dropdown reels for customers and products
function populateReels(customers, products) {
  const customerReel = document.getElementById('customer-reel');
  const productReel = document.getElementById('product-reel');

  customers.forEach(customer => {
    const option = document.createElement('option');
    option.value = customer.id;
    option.textContent = `${customer.name} (ID: ${customer.id})`;
    customerReel.appendChild(option);
  });

  products.forEach(product => {
    const option = document.createElement('option');
    option.value = product.id;
    option.textContent = `${product.description} (ID: ${product.id})`;
    productReel.appendChild(option);
  });
}

// Add a product to the current delivery
function addProduct() {
  const productId = document.getElementById('product-reel').value;
  const quantity = parseInt(document.getElementById('quantity').value, 10);

  const products = JSON.parse(localStorage.getItem('products'));
  const product = products.find(p => p.id == productId);

  if (!product) {
    alert('Please select a valid product.');
    return;
  }

  const existingProduct = currentProducts.find(p => p.id == productId);
  if (existingProduct) {
    existingProduct.quantity += quantity;
  } else {
    currentProducts.push({ ...product, quantity });
  }

  updateProductList();
}

// Display the list of selected products
function updateProductList() {
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';

  currentProducts.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = `${item.description} (Qty: ${item.quantity})`;

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.onclick = () => removeProduct(index);
    li.appendChild(removeButton);

    productList.appendChild(li);
  });
}

// Remove a product from the current delivery
function removeProduct(index) {
  currentProducts.splice(index, 1);
  updateProductList();
}

// Finalize the delivery (new or edited)
function finalizeDelivery() {
  const customerId = document.getElementById('customer-reel').value;

  const customers = JSON.parse(localStorage.getItem('customers'));
  const customer = customers.find(c => c.id == customerId);

  if (!customer) {
    alert('Please select a valid customer.');
    return;
  }

  if (currentProducts.length === 0) {
    alert('Please add at least one product to the delivery.');
    return;
  }

  if (editingDeliveryIndex !== null) {
    // Update existing delivery
    deliveries[editingDeliveryIndex].products = [
      ...deliveries[editingDeliveryIndex].products,
      ...currentProducts
    ];
    editingDeliveryIndex = null; // Reset editing index
  } else {
    // Add a new delivery with a unique number
    deliveries.push({
      id: deliveryCounter++, // Assign the current counter value and increment
      customer,
      products: [...currentProducts]
    });
  }

  // Clear current products and refresh the delivery grid
  currentProducts = [];
  updateProductList();
  updateDeliveryGrid();
}

// Update the delivery grid
function updateDeliveryGrid() {
  const deliveryGrid = document.getElementById('delivery-grid');
  deliveryGrid.innerHTML = ''; // Clear grid

  deliveries.forEach((delivery, index) => {
    const container = document.createElement('div');
    container.className = 'delivery-container';

    const productListHTML = delivery.products
      .map(product => `<li>${product.description} (Qty: ${product.quantity})</li>`)
      .join('');

    container.innerHTML = `
      <h3>Delivery #${delivery.id}</h3>
      <p><strong>Customer:</strong> ${delivery.customer.name}</p>
      <p><strong>Address:</strong> ${delivery.customer.address.join(', ')}</p>
      <p><strong>Phone:</strong> ${delivery.customer.phone.join(', ')}</p>
      <p><strong>Notes:</strong> ${delivery.customer.notes || "No notes provided."}</p>
      <h4>Products:</h4>
      <ul>${productListHTML}</ul>
      <button onclick="editDelivery(${index})">Edit</button>
      <button onclick="removeDelivery(${index})">Remove</button>
    `;

    deliveryGrid.appendChild(container);
  });

  updateDeliveryTotal();
}

// Edit an existing delivery
function editDelivery(index) {
  const delivery = deliveries[index];

  document.getElementById('customer-reel').value = delivery.customer.id;

  currentProducts = [...delivery.products];
  updateProductList();

  editingDeliveryIndex = index; // Set editing index
}

// Remove a delivery from the grid
function removeDelivery(index) {
  deliveries.splice(index, 1);
  updateDeliveryGrid();
}

// Calculate and display the total number of deliveries
function updateDeliveryTotal() {
  const totalDeliveries = deliveries.length;
  const totalElement = document.getElementById('delivery-total');

  if (!totalElement) {
    const newTotalElement = document.createElement('div');
    newTotalElement.id = 'delivery-total';
    newTotalElement.textContent = `Total Deliveries: ${totalDeliveries}`;
    document.body.appendChild(newTotalElement);
  } else {
    totalElement.textContent = `Total Deliveries: ${totalDeliveries}`;
  }
}

// Event listeners
document.getElementById('add-product').addEventListener('click', addProduct);
document.getElementById('finalize-delivery').addEventListener('click', finalizeDelivery);

// Load data on page load
loadData();