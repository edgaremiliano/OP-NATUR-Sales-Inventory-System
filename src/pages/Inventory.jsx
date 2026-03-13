import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Search, AlertTriangle, Layers, Circle } from 'lucide-react';
import AddProductModal from '../components/AddProductModal';
import toast from 'react-hot-toast';

export default function Inventory() {
  const { products, addProduct, mergeProducts } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDuplicatesInfo, setShowDuplicatesInfo] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => typeof p.stock === 'number' && p.stock < 5);

  // Algoritmo simple para encontrar duplicados por nombre exacto
  const findDuplicates = () => {
    const nameMap = {};
    const duplicates = [];

    products.forEach(p => {
      const normalizedName = p.name.trim().toLowerCase();
      if (!nameMap[normalizedName]) {
        nameMap[normalizedName] = [p];
      } else {
        nameMap[normalizedName].push(p);
      }
    });

    Object.values(nameMap).forEach(groupedProducts => {
      if (groupedProducts.length > 1) {
        duplicates.push(groupedProducts);
      }
    });

    return duplicates;
  };

  const duplicateGroups = findDuplicates();

  const handleMergeGroup = (group) => {
    if (!window.confirm(`¿Estás seguro de unificar estos ${group.length} productos? Se sumará el stock y se actualizarán las ventas al primer producto.`)) return;
    
    // Tomamos el primero como principal
    const [targetProduct, ...others] = group;
    const otherIds = others.map(p => p.id);
    
    mergeProducts(targetProduct.id, otherIds);
    setShowDuplicatesInfo(false);
    toast.success('Productos duplicados unificados correctamente');
  };

  // Helper para indicador de stock
  const getStockIndicator = (stock) => {
    if (stock === undefined || stock === null) return <Circle size={10} className="fill-chocolate-600 text-chocolate-600" />;
    if (stock <= 5) return <Circle size={10} className="fill-red-500 text-red-500" title="Stock Bajo" />;
    if (stock <= 15) return <Circle size={10} className="fill-yellow-500 text-yellow-500" title="Stock Medio" />;
    return <Circle size={10} className="fill-green-500 text-green-500" title="Stock Alto" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-chocolate-800/50 p-6 rounded-2xl border border-chocolate-700 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-light uppercase tracking-widest text-beige-50">Inventario</h1>
          <p className="text-sm text-chocolate-400 mt-1">Gestión de base de datos de productos</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={18} />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-4 backdrop-blur-sm">
          <AlertTriangle className="text-red-400 mt-1 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-red-400 font-medium tracking-wide mb-1">Alertas de Inventario Bajo</h3>
            <ul className="text-sm text-red-200/80 space-y-1">
              {lowStockProducts.map(p => (
                <li key={p.id}>• {p.name}: quedan {p.stock} unidades</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {duplicateGroups.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex flex-col gap-4 backdrop-blur-sm">      
          <div className="flex items-start gap-4">
            <Layers className="text-yellow-400 mt-1 flex-shrink-0" size={24} />
            <div className="flex-1">
              <h3 className="text-yellow-400 font-medium tracking-wide mb-1">Posibles Productos Duplicados</h3>
              <p className="text-sm text-yellow-200/80 mb-3">Se han detectado {duplicateGroups.length} grupos de productos con el mismo nombre.</p>
              
              <button 
                onClick={() => setShowDuplicatesInfo(!showDuplicatesInfo)} 
                className="text-xs bg-yellow-900/40 hover:bg-yellow-800/60 text-yellow-400 px-3 py-1.5 rounded uppercase tracking-wider transition-colors"
              >
                {showDuplicatesInfo ? "Ocultar Detalles" : "Ver Duplicados y Unificar"}
              </button>
            </div>
          </div>
          
          {showDuplicatesInfo && (
            <div className="mt-2 space-y-4 border-t border-yellow-700/30 pt-4">
              {duplicateGroups.map((group, idx) => (
                <div key={idx} className="bg-chocolate-900/50 p-4 rounded-xl border border-yellow-700/20 flex justify-between items-center">
                  <div>
                    <h4 className="text-yellow-100 font-medium mb-2 uppercase tracking-wide text-sm">{group[0].name}</h4>
                    <ul className="text-xs text-beige-200/70 space-y-1">
                      {group.map(p => (
                        <li key={p.id}>
                          <span className="text-chocolate-400 font-mono mr-2">[{p.id.substring(0, 15)}...]</span>
                          Precio: ${p.price} | Costo: ${p.cost} | Stock: {p.stock || 0}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button 
                    onClick={() => handleMergeGroup(group)}
                    className="bg-yellow-600 hover:bg-yellow-500 text-yellow-950 px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Unificar 
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-chocolate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              className="input-premium w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-chocolate-600 text-xs uppercase tracking-widest text-chocolate-400">
                <th className="pb-3 px-4 font-medium">ID</th>
                <th className="pb-3 px-4 font-medium">Producto</th>
                <th className="pb-3 px-4 font-medium">Categoría</th>
                <th className="pb-3 px-4 font-medium text-right">Costo</th>
                <th className="pb-3 px-4 font-medium text-right">Precio de Venta</th>
                <th className="pb-3 px-4 font-medium text-right">Stock</th>
                <th className="pb-3 px-4 font-medium text-right">Margen</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} className="border-b border-chocolate-700/50 hover:bg-chocolate-800/50 transition-colors">
                  <td className="py-4 px-4 text-xs font-mono text-chocolate-400">{p.id.startsWith('PRD-') ? p.id : <span title={p.id}>P-Gen</span>}</td>
                  <td className="py-4 px-4 font-medium text-beige-100">{p.name}</td>
                  <td className="py-4 px-4 text-chocolate-300">
                    <span className="bg-chocolate-900 px-3 py-1 rounded-full text-xs border border-chocolate-600">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-red-200/80">${p.cost.toFixed(2)}</td>
                  <td className="py-4 px-4 text-right text-gold-400">${p.price.toFixed(2)}</td>
                  <td className="py-4 px-4 text-right font-medium text-beige-200 flex items-center justify-end gap-2">
                    {getStockIndicator(p.stock)}
                    <span>{p.stock !== undefined ? p.stock : '-'}</span>
                  </td>
                  <td className="py-4 px-4 text-right text-green-400">
                    {p.cost > 0 ? (((p.price - p.cost) / p.cost) * 100).toFixed(0) : 100}%
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-chocolate-400 text-sm">
                    No se encontraron productos en la base de datos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddProduct={addProduct} 
      />
    </div>
  );
}