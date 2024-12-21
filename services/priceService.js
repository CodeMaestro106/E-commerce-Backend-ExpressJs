const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create, Update, Price Object
// Step 1: Create a new price
const createNewPrice = async (productId, newUnitAmount) => {
  try {
    const price = await stripe.prices.create({
      unit_amount: newUnitAmount * 100, // Price in cents
      currency: 'usd', // Replace with your desired currency
      product: productId,
    });
    console.log('New price created:', price);
    return price;
  } catch (error) {
    console.error('Error creating new price:', error);
    throw error;
  }
};

// getPriceObject
const getPrice = async (productId) => {
  try {
    // Fetch all prices for the product
    const prices = await stripe.prices.list({ product: productId });
    return prices.data[0];
  } catch (error) {
    console.error('Error creating new price:', error);
    throw error;
  }
};

// Step 2: Deactivate the old price (optional)
const deactivateOldPrice = async (priceId) => {
  try {
    const updatedPrice = await stripe.prices.update(priceId, {
      active: false,
    });
    console.log('Old price deactivated:', updatedPrice);
    return updatedPrice;
  } catch (error) {
    console.error('Error deactivating old price:', error);
    throw error;
  }
};

const deactivatePricesForProduct = async (productId) => {
  try {
    // Fetch all prices for the product
    const prices = await stripe.prices.list({ product: productId });

    // Deactivate each price
    for (const price of prices.data) {
      await stripe.prices.update(price.id, { active: false });
      console.log(`Deactivated price: ${price.id}`);
    }
  } catch (error) {
    console.error('Error deactivating prices:', error);
    throw error;
  }
};

// Step 3: Update workflow
const updateProductPrice = async (productId, oldPriceId, newPrice) => {
  const newPriceObj = await createNewPrice(productId, newPrice);
  if (oldPriceId) {
    await deactivateOldPrice(oldPriceId);
  }
  return newPriceObj;
};

module.exports = { getPrice, updateProductPrice, deactivatePricesForProduct };
