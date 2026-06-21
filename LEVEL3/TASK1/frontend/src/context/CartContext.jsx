import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [shippingAddress, setShippingAddress] = useState(() => {
    const savedAddress = localStorage.getItem('shippingAddress');
    return savedAddress ? JSON.parse(savedAddress) : { address: '', city: '', postalCode: '', country: '' };
  });

  const [paymentMethod, setPaymentMethod] = useState(() => {
    const savedPayment = localStorage.getItem('paymentMethod');
    return savedPayment ? JSON.parse(savedPayment) : 'Credit Card';
  });

  // Derived calculations
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 || itemsPrice === 0 ? 0 : 15;
  const taxPrice = itemsPrice * 0.15;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
  }, [shippingAddress]);

  useEffect(() => {
    localStorage.setItem('paymentMethod', JSON.stringify(paymentMethod));
  }, [paymentMethod]);

  const addToCart = (product, qty = 1) => {
    setCartItems((prevItems) => {
      const existItem = prevItems.find((item) => item.product === product._id);
      if (existItem) {
        return prevItems.map((item) =>
          item.product === product._id
            ? { ...item, qty: Math.min(product.countInStock, item.qty + qty) }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            product: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            countInStock: product.countInStock,
            qty,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product !== productId));
  };

  const updateQty = (productId, qty) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product === productId ? { ...item, qty: Number(qty) } : item
      )
    );
  };

  const saveShippingAddress = (addressData) => {
    setShippingAddress(addressData);
  };

  const savePaymentMethod = (method) => {
    setPaymentMethod(method);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQty,
        saveShippingAddress,
        savePaymentMethod,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
