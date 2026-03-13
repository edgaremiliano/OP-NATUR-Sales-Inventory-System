import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddSaleModal({ isOpen, onClose, products, onAddSale }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState('CASH');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totals = useMemo(() => {
    if (!selectedProduct) return null;
    const qty = parseInt(quantity) || 0;
    const saleTotal = selectedProduct.price * qty;
    const investment = selectedProduct.cost * qty;
    
    // Estimate commission for live preview (approx 4.176% for terminal)
    const commission = method === 'CLIP' ? saleTotal * 0.04176 : 0; 
    const profit = saleTotal - investment - commission;

    return { saleTotal, investment, commission, profit };
  }, [selectedProduct, quantity, method]);

  const isExceedingStock = selectedProduct && (parseInt(quantity) || 0) > selectedProduct.stock;
  const isInvalidQuantity = !quantity || parseInt(quantity) < 1;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct || isExceedingStock || isInvalidQuantity) return;

    // Al guardar desde el modal, las ganancias e inversión se calculan al instante en addSale() en AppContext
    onAddSale({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: parseInt(quantity),
      method
    });
    
    toast.success(
      `Venta: ${selectedProduct.name} (x${quantity})\nGanancia estimada: $${Math.max(0, totals?.profit || 0).toFixed(2)}`,
      { duration: 4000 }
    );
    
    // Reset
    setSearchTerm('');
    setSelectedProduct(null);
    setQuantity(1);
    setMethod('CASH');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-chocolate-500 hover:text-gold-400 transition-colors">
          <X size={24} />
        </button>
        <div className="mb-6 border-b border-chocolate-700 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-light text-beige-50 tracking-widest uppercase">Registrar Venta</h2>
            <span className="text-xs font-bold text-gold-400 tracking-widest border border-gold-400/30 px-2 py-1 rounded bg-black/20">OP-NATUR</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-xs uppercase tracking-wider text-chocolate-400 mb-1">Buscar Producto</label>
            <input 
              type="text" 
              className="input-premium w-full"
              placeholder="Escribe para buscar (nombre)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedProduct(null);
              }}
            />
            {searchTerm && !selectedProduct && (
              <ul className="mt-1 bg-chocolate-800 border border-chocolate-600 rounded-lg max-h-60 overflow-y-auto absolute z-10 w-full shadow-2xl">
                {filteredProducts.map(p => (
                  <li 
                    key={p.id} 
                    className="px-4 py-3 hover:bg-chocolate-700 cursor-pointer border-b border-chocolate-700/50 last:border-0 transition-colors"
                    onClick={() => {
                      setSelectedProduct(p);
                      setSearchTerm(p.name);
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-beige-50">{p.name}</span>
                      <span className="text-gold-400 font-bold">${p.price}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-chocolate-300">
                      <span>Stock: <span className={p.stock < 5 ? "text-red-400 font-bold" : "text-green-400"}>{p.stock}</span></span>
                      <span>Costo: ${p.cost}</span>
                      <span className="text-chocolate-500 text-[10px] uppercase ml-auto">{p.id}</span>
                    </div>
                  </li>
                ))}
                {filteredProducts.length === 0 && (
                  <li className="px-4 py-3 text-sm text-chocolate-400 text-center italic">
                    No se encontraron productos
                  </li>
                )}
              </ul>
            )}
            
            {selectedProduct && (
              <div className="mt-3 p-3 bg-chocolate-800/40 rounded-lg flex justify-between items-center text-sm border border-chocolate-600/50">
                <div>
                  <span className="block text-beige-100 font-medium">{selectedProduct.name}</span>
                  <span className="text-xs text-chocolate-400">{selectedProduct.id}</span>
                </div>
                <div className="text-right">
                  <span className="block text-gold-400 font-medium">${selectedProduct.price}</span>
                  <span className="text-xs text-chocolate-400">Stock: {selectedProduct.stock} | Costo: ${selectedProduct.cost}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-chocolate-400 mb-1">Cantidad</label>
              <input 
                type="number" 
                min="1"
                max={selectedProduct ? selectedProduct.stock : undefined}
                className={`input-premium w-full ${isExceedingStock ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              {isExceedingStock && (
                <p className="text-red-400 text-xs mt-1 font-medium">Excede el stock ({selectedProduct.stock})</p>
              )}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-chocolate-400 mb-1">Método de Pago</label>
              <select 
                className="input-premium w-full appearance-none"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="CASH">Efectivo (CASH)</option>
                <option value="CLIP">Terminal (Tarjeta)</option>
              </select>
            </div>
          </div>

          {selectedProduct && totals && (
            <div className="bg-chocolate-900/50 p-4 rounded-xl border border-chocolate-600 mt-6 space-y-2">
              <h3 className="text-sm uppercase tracking-widest text-gold-400 mb-2">Desglose Financiero</h3>
              <div className="flex justify-between text-sm text-beige-100">
                <span>Inversión ({selectedProduct.cost} x {quantity}):</span>
                <span>${totals.investment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-beige-100">
                <span>Venta Total ({selectedProduct.price} x {quantity}):</span>
                <span>${totals.saleTotal.toFixed(2)}</span>
              </div>
              {method === 'CLIP' && (
                <div className="flex justify-between text-sm text-red-300">
                  <span>Comisión Terminal (Aprox):</span>
                  <span>-${totals.commission.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg text-gold-400 pt-2 border-t border-chocolate-700 mt-2">
                <span>Ganancia Neta:</span>
                <span>${totals.profit.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={!selectedProduct || isExceedingStock || isInvalidQuantity}
            >
              Guardar Venta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}