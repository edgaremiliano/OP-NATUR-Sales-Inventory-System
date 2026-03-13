/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { importedProducts as p1 } from '../data/importedProducts1';
import { importedProducts3 as p3 } from '../data/importedProducts3';
import { importedProducts4 as p4 } from '../data/importedProducts4';
import { getInitialSales } from '../data/initialSales';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  // Lazy initialization with localStorage
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('products');
    if (saved) return JSON.parse(saved);
    
    // Unir todas las partes del inventario en una sola lista continua
    // y asignar un ID único basado en el nombre (normalizado) si es que no lo tenían.
    const allImportedProducts = [...p1, ...p3, ...p4].map((p, index) => ({
      ...p,
      // Si el producto no tiene ID, le generamos uno normalizado y único 
      id: p.id || `prod-${p.name.replace(/\s+/g, '-').toLowerCase()}-${index}`
    }));
    
    return allImportedProducts;
  });
  
  const getSalesFromStorage = () => {
    const saved = localStorage.getItem('sales');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
    // Fallback: Si no hay ventas, cargar las iniciales, inyectándoles todos los productos unidos
    const fallbackProducts = [...p1, ...p3, ...p4];
    return getInitialSales(fallbackProducts);
  };

  const [sales, setSales] = useState(getSalesFromStorage);

  const [closedMonths, setClosedMonths] = useState(() => {
    const saved = localStorage.getItem('closedMonths');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const initialSalesData = getSalesFromStorage();
    if (initialSalesData.length > 0) {
      // Tomamos el mes de la venta más reciente como seleccionado por defecto
      const dates = initialSalesData.map(s => {
        const d = new Date(s.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }).sort().reverse();
      return dates[0];
    }
    
    // Si realmente no hay nada
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('closedMonths', JSON.stringify(closedMonths));
  }, [closedMonths]);

  // Generador automático de IDs (PRD-0001...)
  const generateNextProductId = (currentProducts) => {
    const prdIds = currentProducts
      .map(p => p.id)
      .filter(id => typeof id === 'string' && id.startsWith('PRD-'))
      .map(id => parseInt(id.replace('PRD-', ''), 10))
      .filter(num => !isNaN(num));
    
    const maxId = prdIds.length > 0 ? Math.max(...prdIds) : 0;
    return `PRD-${String(maxId + 1).padStart(4, '0')}`;
  };

  const login = (username, password) => {
    // Basic auth for 2 users
    if ((username === 'admin1' && password === 'admin123') || 
        (username === 'admin2' && password === 'admin123')) {
      setUser({ username });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const toggleMonthStatus = (monthKey) => {
    setClosedMonths(prev => 
      prev.includes(monthKey) ? prev.filter(m => m !== monthKey) : [...prev, monthKey]
    );
  };

  const processSale = (saleData) => {
    const product = products.find(
      p => p.id === saleData.productId || p.name === saleData.productName
    );

    const unitCost = product ? product.cost : (saleData.cost || 0);
    const unitPrice = product ? product.price : (saleData.price || 0);
    
    const quantity = parseInt(saleData.quantity) || 1;
    const method = saleData.method || 'CASH';
    
    const investment = unitCost * quantity;
    const saleTotal = unitPrice * quantity;

    let commission = 0;
    if (method === 'CLIP') {
      if (saleData.commission !== undefined && saleData.commission !== null) {
        commission = parseFloat(saleData.commission); 
      }
    }

    const profit = method === 'CLIP' 
      ? (saleTotal - investment - commission)
      : (saleTotal - investment);

    const isHistoricalData = saleData.saleTotal !== undefined && saleData.profit !== undefined && saleData.date === '2026-02-28T12:00:00.000Z';

    return {
      ...saleData,
      id: saleData.id || Date.now() + Math.random().toString(),
      date: isHistoricalData ? saleData.date : (saleData.date || new Date().toISOString()),
      productId: product ? product.id : saleData.productId,
      productName: product ? product.name : saleData.productName,
      cost: isHistoricalData ? saleData.cost : unitCost,
      price: isHistoricalData ? saleData.price : unitPrice,
      quantity,
      method,
      saleTotal: isHistoricalData ? saleData.saleTotal : saleTotal,
      investment: isHistoricalData ? saleData.investment : investment,
      commission: isHistoricalData ? saleData.commission : commission,
      profit: isHistoricalData ? saleData.profit : profit
    };
  };

  const addSale = (saleData) => {
    const newSale = processSale(saleData);
    setSales([...sales, newSale]);
  };

  const addMultipleSales = (salesArray) => {
    const newSales = salesArray.map(processSale);
    setSales([...sales, ...newSales]);
  };

  const addProduct = (productData) => {
    const newId = generateNextProductId(products);
    // Si no tenía stock definido anteriormente, lo inicializamos en 0
    const stock = productData.stock !== undefined ? parseInt(productData.stock) : 0;
    setProducts([...products, { ...productData, id: newId, stock }]);
  };

  // Función para unificar productos duplicados
  const mergeProducts = (targetProductId, duplicateIds) => {
    const targetProduct = products.find(p => p.id === targetProductId);
    if (!targetProduct) return;

    // Calcular la suma de stock de los duplicados para no perder inventario (opcional)
    let extraStock = 0;
    products.forEach(p => {
      if (duplicateIds.includes(p.id) && p.stock) {
        extraStock += Number(p.stock);
      }
    });

    // 1. Filtrar los productos duplicados, dejando sólo el resto, y asegurarnos de que el principal sea PRD- si no lo era
    const isTargetFormatValid = typeof targetProduct.id === 'string' && targetProduct.id.startsWith('PRD-');
    const finalProductId = isTargetFormatValid ? targetProduct.id : generateNextProductId(products);

    const updatedProducts = products.filter(p => !duplicateIds.includes(p.id) && p.id !== targetProduct.id);
    
    // Agregamos el producto unificado (con su nuevo formato si le tocaba y sumando el stock)
    const finalProduct = {
      ...targetProduct,
      id: finalProductId,
      stock: (Number(targetProduct.stock) || 0) + extraStock
    };
    
    setProducts([...updatedProducts, finalProduct]);

    // 2. Mapear ventas pasadas para asegurarnos de que el historial no se rompa y apunte al nuevo producto
    const updatedSales = sales.map(sale => {
      // Si la venta apuntaba a un ID duplicado o al viejo ID (antes del PRD-)
      if (duplicateIds.includes(sale.productId) || sale.productId === targetProduct.id) {
        return { ...sale, productId: finalProductId, productName: finalProduct.name };
      }
      return sale;
    });

    setSales(updatedSales);
  };

  return (
    <AppContext.Provider value={{ 
      user, login, logout, 
      products, addProduct, mergeProducts,
      sales, addSale, addMultipleSales,
      selectedMonth, setSelectedMonth,
      closedMonths, toggleMonthStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);