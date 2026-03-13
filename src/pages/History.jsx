import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  LineChart, Line, Legend
} from 'recharts';

export default function History() {
  const { sales } = useAppContext();

  // Formateador estricto a 2 decimales
  const formatCurrency = (value) => {
    return (value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Process sales data into months
  const monthlyData = useMemo(() => {
    const months = {};
    
    sales.forEach(sale => {
      const date = new Date(sale.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      
      if (!months[monthKey]) {
        months[monthKey] = {
          monthKey,
          label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
          totalSales: 0,
          totalInvestment: 0,
          totalCommission: 0,
          grossProfit: 0,
          unitsSold: 0,
          cashSales: 0,
          cardSales: 0
        };
      }
      
      months[monthKey].totalSales += (sale.saleTotal || 0);
      months[monthKey].totalInvestment += (sale.investment || 0);
      months[monthKey].totalCommission += (sale.commission || 0);
      months[monthKey].unitsSold += (sale.quantity || 0);
      if (sale.method === 'CASH') months[monthKey].cashSales += (sale.saleTotal || 0);
      if (sale.method === 'CLIP') months[monthKey].cardSales += (sale.saleTotal || 0);
    });

    return Object.values(months)
      .map(month => ({
        ...month,
        // Ganancia Bruta = Venta Total - Inversión Total - Comisión Total
        grossProfit: month.totalSales - month.totalInvestment - month.totalCommission
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [sales]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center bg-chocolate-800/50 p-6 rounded-2xl border border-chocolate-700 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-light uppercase tracking-widest text-beige-50">Historial de Meses</h1>
          <p className="text-sm text-chocolate-400 mt-1">Comparativa de rendimiento a lo largo del tiempo</p>
        </div>
      </div>

      {monthlyData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 shadow-xl">
              <h3 className="text-xs uppercase tracking-widest text-chocolate-400 mb-6">Evolución de Ventas y Ganancias</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3b2417" vertical={false} />
                    <XAxis dataKey="label" stroke="#805033" tick={{fill: '#f5f5dc', fontSize: 12}} />
                    <YAxis stroke="#805033" tick={{fill: '#f5f5dc', fontSize: 12}} />
                    <RechartsTooltip 
                      cursor={{fill: '#2c1b11'}} 
                      contentStyle={{backgroundColor: '#1e120b', border: '1px solid #5c3924', color: '#f5f5dc', borderRadius: '8px'}} 
                      formatter={(value) => `$${formatCurrency(value)}`}
                    />
                    <Legend wrapperStyle={{ color: '#f5f5dc', fontSize: '12px' }}/>
                    <Line type="monotone" dataKey="totalSales" name="Ventas Totales" stroke="#d4af37" strokeWidth={3} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="grossProfit" name="Ganancia Bruta" stroke="#805033" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6 shadow-xl">
              <h3 className="text-xs uppercase tracking-widest text-chocolate-400 mb-6">Comparación Efectivo vs Tarjeta</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3b2417" vertical={false} />
                    <XAxis dataKey="label" stroke="#805033" tick={{fill: '#f5f5dc', fontSize: 12}} />
                    <YAxis stroke="#805033" tick={{fill: '#f5f5dc', fontSize: 12}} />
                    <RechartsTooltip 
                      cursor={{fill: '#2c1b11'}} 
                      contentStyle={{backgroundColor: '#1e120b', border: '1px solid #5c3924', color: '#f5f5dc', borderRadius: '8px'}} 
                      formatter={(value) => `$${formatCurrency(value)}`}
                    />
                    <Legend wrapperStyle={{ color: '#f5f5dc', fontSize: '12px' }}/>
                    <Bar dataKey="cashSales" name="Efectivo" fill="#d4af37" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cardSales" name="Terminal" fill="#805033" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card p-6 shadow-xl overflow-hidden mt-6 relative z-10">
            <h3 className="text-lg font-light uppercase tracking-widest text-beige-50 mb-6">Resumen Mensual</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-chocolate-600 text-[10px] uppercase tracking-widest text-chocolate-400">
                    <th className="pb-3 px-4 font-medium">Mes</th>
                    <th className="pb-3 px-4 font-medium text-right">Unidades Vendidas</th>
                    <th className="pb-3 px-4 font-medium text-right">Venta Total</th>
                    <th className="pb-3 px-4 font-medium text-right text-gold-400">Ganancia Bruta</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.slice().reverse().map((month) => (
                    <tr key={month.monthKey} className="border-b border-chocolate-700/50 hover:bg-chocolate-800/50 transition-colors">
                      <td className="py-4 px-4 font-medium text-beige-100">{month.label}</td>
                      <td className="py-4 px-4 text-right text-beige-200">{month.unitsSold}</td>
                      <td className="py-4 px-4 text-right font-medium text-beige-50">${formatCurrency(month.totalSales)}</td>
                      <td className="py-4 px-4 text-right font-bold text-gold-400">${formatCurrency(month.grossProfit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card p-8 text-center text-chocolate-400">
          No hay datos suficientes para mostrar el historial.
        </div>
      )}
    </div>
  );
}