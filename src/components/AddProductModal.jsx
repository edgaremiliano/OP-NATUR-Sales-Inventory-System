import { useState } from 'react';
import { X } from 'lucide-react';

export default function AddProductModal({ isOpen, onClose, onAddProduct }) {
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    price: '',
    category: '',
    stock: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddProduct({
      name: formData.name,
      cost: parseFloat(formData.cost) || 0,
      price: parseFloat(formData.price) || 0,
      category: formData.category || 'General',
      stock: parseInt(formData.stock) || 0
    });
    setFormData({ name: '', cost: '', price: '', category: '', stock: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-chocolate-500 hover:text-gold-400 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-xl font-light text-beige-50 mb-6 tracking-widest uppercase border-b border-chocolate-700 pb-4">Nuevo Producto</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-chocolate-400 mb-1">Nombre del Producto</label>
            <input 
              type="text" 
              required
              className="input-premium w-full"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-chocolate-400 mb-1">Costo ($)</label>
              <input 
                type="number" 
                required
                min="0"
                step="0.01"
                className="input-premium w-full"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-chocolate-400 mb-1">Precio Venta ($)</label>
              <input 
                type="number" 
                required
                min="0"
                step="0.01"
                className="input-premium w-full"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-chocolate-400 mb-1">Categoría</label>
              <input 
                type="text" 
                className="input-premium w-full"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-chocolate-400 mb-1">Stock</label>
              <input 
                type="number" 
                min="0"
                className="input-premium w-full"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Producto</button>
          </div>
        </form>
      </div>
    </div>
  );
}