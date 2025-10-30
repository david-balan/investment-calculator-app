// FILE: app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, PiggyBank, Save, History } from 'lucide-react';

export default function InvestmentCalculator() {
  const [activeTab, setActiveTab] = useState('stocks');
  const [savedCalculations, setSavedCalculations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Stock Investment State
  const [stockInitial, setStockInitial] = useState(10000);
  const [stockMonthly, setStockMonthly] = useState(500);
  const [stockReturn, setStockReturn] = useState(8);
  const [stockYears, setStockYears] = useState(20);
  
  // Retirement State
  const [retireInitial, setRetireInitial] = useState(50000);
  const [retireMonthly, setRetireMonthly] = useState(1000);
  const [retireReturn, setRetireReturn] = useState(7);
  const [retireYears, setRetireYears] = useState(30);
  const [currentAge, setCurrentAge] = useState(35);

  useEffect(() => {
    fetchCalculations();
  }, []);

  const fetchCalculations = async () => {
    try {
      const response = await fetch('/api/calculations');
      if (response.ok) {
        const data = await response.json();
        setSavedCalculations(data);
      }
    } catch (error) {
      console.error('Error fetching calculations:', error);
    }
  };

  const saveCalculation = async () => {
    setSaving(true);
    const calculation = {
      type: activeTab,
      parameters: activeTab === 'stocks' 
        ? { stockInitial, stockMonthly, stockReturn, stockYears }
        : { retireInitial, retireMonthly, retireReturn, retireYears, currentAge },
      results: {
        finalBalance: finalData.balance,
        totalContributions: finalData.contributions,
        totalEarnings: finalData.earnings
      }
    };

    try {
      const response = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculation)
      });

      if (response.ok) {
        await fetchCalculations();
        alert('Calculation saved successfully!');
      }
    } catch (error) {
      console.error('Error saving calculation:', error);
      alert('Failed to save calculation');
    } finally {
      setSaving(false);
    }
  };

  const loadCalculation = (calc: any) => {
    if (calc.type === 'stocks') {
      setActiveTab('stocks');
      setStockInitial(calc.parameters.stockInitial);
      setStockMonthly(calc.parameters.stockMonthly);
      setStockReturn(calc.parameters.stockReturn);
      setStockYears(calc.parameters.stockYears);
    } else {
      setActiveTab('retirement');
      setRetireInitial(calc.parameters.retireInitial);
      setRetireMonthly(calc.parameters.retireMonthly);
      setRetireReturn(calc.parameters.retireReturn);
      setRetireYears(calc.parameters.retireYears);
      setCurrentAge(calc.parameters.currentAge);
    }
    setShowHistory(false);
  };
  
  const calculateInvestment = (initial: number, monthly: number, annualReturn: number, years: number) => {
    const monthlyRate = annualReturn / 100 / 12;
    const months = years * 12;
    const data = [];
    
    let balance = initial;
    let totalContributions = initial;
    
    data.push({
      year: 0,
      balance: Math.round(balance),
      contributions: Math.round(totalContributions),
      earnings: 0
    });
    
    for (let month = 1; month <= months; month++) {
      balance = balance * (1 + monthlyRate) + monthly;
      totalContributions += monthly;
      
      if (month % 12 === 0) {
        const year = month / 12;
        data.push({
          year,
          balance: Math.round(balance),
          contributions: Math.round(totalContributions),
          earnings: Math.round(balance - totalContributions)
        });
      }
    }
    
    return data;
  };
  
  const stockData = calculateInvestment(stockInitial, stockMonthly, stockReturn, stockYears);
  const retireData = calculateInvestment(retireInitial, retireMonthly, retireReturn, retireYears);
  
  const activeData = activeTab === 'stocks' ? stockData : retireData;
  const finalData = activeData[activeData.length - 1];
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Investment & Retirement Calculator</h1>
          <p className="text-gray-600">Plan your financial future with compound interest projections</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 justify-center flex-wrap">
          <button
            onClick={() => setActiveTab('stocks')}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'stocks'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <TrendingUp size={20} />
            Stock Investment
          </button>
          <button
            onClick={() => setActiveTab('retirement')}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'retirement'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <PiggyBank size={20} />
            Retirement Planning
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-50 transition-all"
          >
            <History size={20} />
            History ({savedCalculations.length})
          </button>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Saved Calculations</h2>
            {savedCalculations.length === 0 ? (
              <p className="text-gray-600">No saved calculations yet. Save your first calculation!</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {savedCalculations.map((calc: any) => (
                  <div
                    key={calc.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-all"
                    onClick={() => loadCalculation(calc)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800 capitalize">{calc.type} Calculation</p>
                        <p className="text-sm text-gray-600">
                          {new Date(calc.created_at).toLocaleDateString()} at{' '}
                          {new Date(calc.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(calc.results.finalBalance)}
                        </p>
                        <p className="text-xs text-gray-600">Final Balance</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <DollarSign className="text-blue-600" />
              {activeTab === 'stocks' ? 'Investment Details' : 'Retirement Details'}
            </h2>
            
            {activeTab === 'stocks' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Investment
                  </label>
                  <input
                    type="number"
                    value={stockInitial}
                    onChange={(e) => setStockInitial(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Contribution
                  </label>
                  <input
                    type="number"
                    value={stockMonthly}
                    onChange={(e) => setStockMonthly(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Annual Return (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={stockReturn}
                    onChange={(e) => setStockReturn(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Period (Years)
                  </label>
                  <input
                    type="number"
                    value={stockYears}
                    onChange={(e) => setStockYears(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Age
                  </label>
                  <input
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Retirement Savings
                  </label>
                  <input
                    type="number"
                    value={retireInitial}
                    onChange={(e) => setRetireInitial(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Contribution
                  </label>
                  <input
                    type="number"
                    value={retireMonthly}
                    onChange={(e) => setRetireMonthly(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Annual Return (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={retireReturn}
                    onChange={(e) => setRetireReturn(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years Until Retirement
                  </label>
                  <input
                    type="number"
                    value={retireYears}
                    onChange={(e) => setRetireYears(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Retirement Age:</strong> {currentAge + retireYears} years
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={saveCalculation}
              disabled={saving}
              className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-all disabled:bg-gray-400"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Calculation'}
            </button>
          </div>
          
          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-600 mb-1">Final Balance</p>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(finalData.balance)}</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-600 mb-1">Total Contributions</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(finalData.contributions)}</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-purple-600">{formatCurrency(finalData.earnings)}</p>
              </div>
            </div>
            
            {/* Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Growth Projection</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={activeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="year" 
                    label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    name="Total Balance"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="contributions" 
                    stroke="#16a34a" 
                    strokeWidth={2}
                    name="Contributions"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="#9333ea" 
                    strokeWidth={2}
                    name="Earnings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Investment Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Your Contributions:</span>
                  <span className="font-semibold text-lg">{formatCurrency(finalData.contributions)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Investment Earnings:</span>
                  <span className="font-semibold text-lg text-purple-600">{formatCurrency(finalData.earnings)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-gray-900 font-semibold">Total Value:</span>
                  <span className="font-bold text-2xl text-blue-600">{formatCurrency(finalData.balance)}</span>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-purple-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-gray-700">
                    <strong>Return on Investment:</strong> Your money will grow by{' '}
                    <span className="text-purple-600 font-bold">
                      {((finalData.earnings / finalData.contributions) * 100).toFixed(1)}%
                    </span>
                    {' '}through compound interest over {activeTab === 'stocks' ? stockYears : retireYears} years.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}