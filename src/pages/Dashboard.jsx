import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import AddSaleModal from '../components/AddSaleModal';
import { Plus, TrendingUp, CreditCard, Banknote, Landmark, Target, PercentCircle, ArrowUpRight, ArrowDownRight, Package, Lock, Unlock, Upload, AlertTriangle, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { motion } from 'framer-motion';

// Helper for minimal cards
const StatCard = ({ title, value, icon, trend, subtext, tooltip, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="card p-6 flex flex-col justify-between group hover:border-gold-400 border border-transparent bg-wood-900/50 backdrop-blur-sm rounded-xl shadow-lg transition-all relative overflow-hidden"
  >
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent to-gold-500/0 group-hover:to-gold-500/50 transition-all duration-500"></div>
    <div className="flex justify-between items-start mb-4">
      <div className="text-chocolate-400 group-hover:text-gold-400 transition-colors p-2 bg-wood-800 rounded-lg" title={tooltip}>
        {icon}
      </div>
      {trend !== undefined && (
        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${trend >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {trend >= 0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-chocolate-300 mb-1 flex items-center gap-2">
        {title}
      </p>
      <h3 className={`text-3xl font-bold tracking-tight ${typeof value === 'string' && value.startsWith('-$') ? 'text-red-400' : 'text-beige-50'}`}>
        {value}
      </h3>
      {subtext && <p className="text-sm font-medium text-chocolate-400 mt-2">{subtext}</p>}
    </div>
  </motion.div>
);

export default function Dashboard() {
  const { 
    sales, 
    products, 
    user, 
    selectedMonth, 
    setSelectedMonth,
    closedMonths,
    toggleMonthStatus,
    addMultipleSales,
    addSale
  } = useAppContext();

  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);

  const availableMonths = [...new Set(sales.map(s => {
    const d = new Date(s.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }))].sort().reverse();
  
  if (!availableMonths.includes(selectedMonth)) {
    availableMonths.unshift(selectedMonth);
  }

  const filteredSales = sales.filter(sale => {
    const d = new Date(sale.date);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return mKey === selectedMonth;
  });

  const isMonthClosed = closedMonths.includes(selectedMonth);

  const formattedMonth = new Date(selectedMonth + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const totalSales = filteredSales.reduce((acc, sale) => acc + (sale.saleTotal || 0), 0);
  const totalInvestment = filteredSales.reduce((acc, sale) => acc + (sale.investment || 0), 0);
  const totalCommission = filteredSales.reduce((acc, sale) => acc + (sale.commission || 0), 0);
  const totalGrossProfit = totalSales - totalInvestment - totalCommission;
  
  // Deduct fixed monthly expenses dynamically or standard fixed
  const fixedExpenses = 549; // $549.00 fixed monthly cost
  const totalNetProfit = totalGrossProfit - fixedExpenses;

  const unitsSold = filteredSales.reduce((acc, sale) => acc + (sale.quantity || 0), 0);
  const avgTicket = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;

  // Format currency
  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const profitTrend = 5.2;

  // Inventory Overview Data
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  // Chart Data Preparation
  
  // 1. Monthly Sales
  const monthlySalesMap = {};
  sales.forEach(sale => {
    const d = new Date(sale.date);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlySalesMap[mKey]) monthlySalesMap[mKey] = 0;
    monthlySalesMap[mKey] += (sale.saleTotal || 0);
  });
  const monthlySalesData = Object.keys(monthlySalesMap).sort().map(key => ({
    name: key,
    total: monthlySalesMap[key]
  })).slice(-6); // Last 6 months

  // 2. Payment Method Distribution
  const paymentMethodMap = { CASH: 0, CLIP: 0 };
  filteredSales.forEach(sale => {
    if (sale.method === 'CLIP') paymentMethodMap.CLIP += (sale.saleTotal || 0);
    else paymentMethodMap.CASH += (sale.saleTotal || 0);
  });
  const paymentMethodData = [
    { name: 'CASH', value: paymentMethodMap.CASH },
    { name: 'CLIP', value: paymentMethodMap.CLIP }
  ].filter(d => d.value > 0);
  const COLORS = ['#d4af37', '#8b5a2b']; // Gold and Chocolate

  // 3. Top Selling Products
  const productSalesMap = {};
  filteredSales.forEach(sale => {
    if (!productSalesMap[sale.productName]) productSalesMap[sale.productName] = 0;
    productSalesMap[sale.productName] += (sale.quantity || 0);
  });
  const topProductsData = Object.keys(productSalesMap)
    .map(key => ({ name: key, quantity: productSalesMap[key] }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // 4. Daily Sales Trend
  const dailySalesMap = {};
  filteredSales.forEach(sale => {
    const d = new Date(sale.date);
    const day = String(d.getDate()).padStart(2, '0');
    if (!dailySalesMap[day]) dailySalesMap[day] = 0;
    dailySalesMap[day] += (sale.saleTotal || 0);
  });
  const dailySalesData = Object.keys(dailySalesMap).sort().map(day => ({
    name: day,
    total: dailySalesMap[day]
  }));

  const lowStockProductsList = products.filter(p => p.stock !== undefined && p.stock <= 5 && typeof p.id === 'string' && p.id.startsWith('PRD-'));

  const handleFileUpload = (e) => {
    if (isMonthClosed) {
      alert("El mes está cerrado, no se pueden importar ventas.");
      return;
    }
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split('\n').map(row => row.split(','));
      
      const newSales = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].length < 3) continue;
        const [productName, qty, method] = rows[i];
        
        const matchedProduct = products.find(p => p.name.toLowerCase() === productName.trim().toLowerCase());
        
        if (matchedProduct) {
          newSales.push({
            productId: matchedProduct.id,
            productName: matchedProduct.name,
            quantity: parseInt(qty.trim()) || 1,
            method: method.trim().toUpperCase() === 'CLIP' ? 'CLIP' : 'CASH',
            date: new Date(selectedMonth + '-01').toISOString()
          });
        }
      }

      if (newSales.length > 0) {
        addMultipleSales(newSales);
        alert(`Se han importado ${newSales.length} ventas con éxito.`);
      } else {
        alert("No se encontraron coincidencias de productos en el inventario.");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  return (
    <div className="space-y-6 pb-20">
      {lowStockProductsList.length > 0 && (
        <div className="bg-red-900/40 border border-red-500/50 text-red-100 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-red-400 mt-1 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-semibold text-red-300">Inventario Bajo</h4>
            <div className="text-sm mt-1">
              {lowStockProductsList.map(p => (
                <span key={p.id} className="inline-block mr-4">
                  {p.name}: <strong className="text-red-200">{p.stock} unidades</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center bg-chocolate-800/50 p-6 rounded-2xl border border-chocolate-700 backdrop-blur-sm"
      >
        <div>
          <h1 className="text-2xl font-light uppercase tracking-widest text-beige-50">Dashboard</h1>
          <p className="text-sm text-chocolate-400 mt-1 capitalize">{formattedMonth}</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-chocolate-900 border border-chocolate-600 text-beige-100 text-sm rounded-lg focus:ring-gold-500 focus:border-gold-500 block p-2.5"
          >
            {availableMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button 
            onClick={() => setIsAddSaleOpen(true)} 
            className="btn-primary flex items-center gap-2"
            disabled={isMonthClosed}
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nueva Venta</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ventas Totales" 
          value={`$${formatCurrency(totalSales)}`} 
          icon={<Banknote size={24} />} 
          trend={profitTrend}
          tooltip="Suma total de todas las ventas del mes (Ingreso Bruto)"
          delay={0.1}
        />
        <StatCard 
          title="Ganancia Bruta" 
          value={`$${formatCurrency(totalGrossProfit)}`} 
          icon={<Target size={24} />} 
          tooltip="Ventas - Inversión - Comisiones"
          delay={0.2}
        />
        <StatCard 
          title="Gastos Fijos" 
          value={`-$${formatCurrency(fixedExpenses)}`} 
          icon={<FileText size={24} />} 
          tooltip="Gastos fijos mensuales aproximados"
          delay={0.3}
        />
        <StatCard 
          title="Ganancia Neta" 
          value={`$${formatCurrency(totalNetProfit)}`} 
          icon={<Landmark size={24} />} 
          trend={profitTrend}
          tooltip="Ganancia real después de restar inversión, comisiones y gastos fijos"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Monthly Sales */}
        <div className="card p-6">
          <h3 className="text-lg text-beige-50 font-light mb-6 uppercase tracking-widest">Ventas Mensuales</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a3b32" vertical={false} />
                <XAxis dataKey="name" stroke="#a08a75" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a08a75" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#2d241e', borderColor: '#4a3b32', borderRadius: '8px' }}
                  itemStyle={{ color: '#d4af37' }}
                  formatter={(value) => [`$${formatCurrency(value)}`, 'Ventas']}
                />
                <Bar dataKey="total" fill="#d4af37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Sales Trend */}
        <div className="card p-6">
          <h3 className="text-lg text-beige-50 font-light mb-6 uppercase tracking-widest">Tendencia Diaria ({selectedMonth})</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a3b32" vertical={false} />
                <XAxis dataKey="name" stroke="#a08a75" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a08a75" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#2d241e', borderColor: '#4a3b32', borderRadius: '8px' }}
                  itemStyle={{ color: '#d4af37' }}
                  formatter={(value) => [`$${formatCurrency(value)}`, 'Ventas']}
                  labelFormatter={(label) => `Día ${label}`}
                />
                <Line type="monotone" dataKey="total" stroke="#d4af37" strokeWidth={3} dot={{ fill: '#2d241e', stroke: '#d4af37', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-6">
          <h3 className="text-lg text-beige-50 font-light mb-6 uppercase tracking-widest">Top 5 Productos</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a3b32" horizontal={false} />
                <XAxis type="number" stroke="#a08a75" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#a08a75" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#2d241e', borderColor: '#4a3b32', borderRadius: '8px' }}
                  itemStyle={{ color: '#d4af37' }}
                  formatter={(value) => [value, 'Unidades']}
                />
                <Bar dataKey="quantity" fill="#8b5a2b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="card p-6">
          <h3 className="text-lg text-beige-50 font-light mb-6 uppercase tracking-widest">Métodos de Pago</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#2d241e', borderColor: '#4a3b32', borderRadius: '8px' }}
                  itemStyle={{ color: '#beige-50' }}
                  formatter={(value) => [`$${formatCurrency(value)}`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{ color: '#a08a75', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <AddSaleModal 
        isOpen={isAddSaleOpen} 
        onClose={() => setIsAddSaleOpen(false)} 
        products={products}
        onAddSale={addSale} 
      />
    </div>
  );
}