import { useState } from 'react';
import Papa from 'papaparse';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UploadCloud, BarChart3, Clock, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [chartData, setChartData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metrics, setMetrics] = useState({ totalProjects: 0, averageLatency: 0 });
  const [fileName, setFileName] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setChartData([]);

    const latencyByYear = {};
    let totalLatencySum = 0;
    let validProjectCount = 0;

    Papa.parse(file, {
      header: true,
      worker: true,
      skipEmptyLines: true,
      step: function(result) {
        const row = result.data;
        const vintageYearStr = row["First Year of Project (Vintage)"];
        const issuanceDateStr = row["Date Project Added to Database"];

        if (vintageYearStr && issuanceDateStr) {
          const vintageYear = parseInt(vintageYearStr);
          const issuanceYear = new Date(issuanceDateStr).getFullYear();

          if (!isNaN(vintageYear) && !isNaN(issuanceYear) && issuanceYear >= vintageYear) {
            const latency = issuanceYear - vintageYear;
            totalLatencySum += latency;
            validProjectCount++;

            if (!latencyByYear[vintageYear]) {
              latencyByYear[vintageYear] = { sum: 0, count: 0 };
            }
            latencyByYear[vintageYear].sum += latency;
            latencyByYear[vintageYear].count += 1;
          }
        }
      },
      complete: function() {
        const formattedData = Object.keys(latencyByYear)
          .sort((a, b) => a - b)
          .map(year => ({
            year: year,
            latency: parseFloat((latencyByYear[year].sum / latencyByYear[year].count).toFixed(2))
          }));

        const finalAvgLatency = validProjectCount > 0 ? (totalLatencySum / validProjectCount).toFixed(2) : 0;

        setChartData(formattedData);
        setMetrics({ totalProjects: validProjectCount, averageLatency: finalAvgLatency });
        setIsProcessing(false);
      },
      error: function(error) {
        console.error("Data Ingestion Failed:", error);
        alert("Failed to parse the CSV file. Ensure it matches the Berkeley dataset schema.");
        setIsProcessing(false);
      }
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Macro Market Analytics</h2>
        <p className="text-gray-500 text-sm">Dynamic empirical ingestion of the Berkeley Carbon Trading Project database.</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <UploadCloud size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">Raw Dataset Ingestion</h3>
            <p className="text-xs text-gray-500">Upload the global VCM .csv to dynamically generate the latency proof.</p>
          </div>
        </div>
        
        <div className="relative">
          <input 
            type="file" 
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <button 
            disabled={isProcessing}
            className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 disabled:bg-gray-400"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <span>Select CSV File</span>}
          </button>
        </div>
      </div>

      {isProcessing && (
        <div className="p-6 text-center text-gray-500 flex flex-col items-center space-y-3">
          <Loader2 className="animate-spin text-blue-600" size={28} />
          <p className="text-sm">Parsing raw dataset via Web Workers. Aggregating cells...</p>
        </div>
      )}

      {!isProcessing && chartData.length > 0 && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
              <CheckCircle2 className="text-green-500 mb-1" size={20} />
              <p className="text-xs text-gray-500 font-medium">Data Ingested</p>
              <h4 className="text-sm font-bold text-gray-900 mt-1 truncate w-full px-2">{fileName}</h4>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
              <BarChart3 className="text-blue-500 mb-1" size={20} />
              <p className="text-xs text-gray-500 font-medium">Valid Projects Parsed</p>
              <h4 className="text-xl font-bold text-gray-900 mt-1">{metrics.totalProjects.toLocaleString()}</h4>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm flex flex-col justify-center items-center text-center">
              <AlertTriangle className="text-red-500 mb-1" size={20} />
              <p className="text-xs text-red-600 font-medium">Global Average Latency</p>
              <h4 className="text-xl font-bold text-red-700 mt-1">{metrics.averageLatency} Years</h4>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="text-gray-400" size={16} />
              <h3 className="font-bold text-gray-800 text-sm">Verification Latency Trend (Vintage to Issuance)</h3>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="year" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} yrs`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value} Years`, 'Avg Verification Latency']}
                    labelFormatter={(label) => `Vintage Year: ${label}`}
                  />
                  <Area type="monotone" dataKey="latency" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorLatency)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}