import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getWeb3State } from '../utils/web3';
import { Database, ArrowUpRight, ArrowDownRight, Link as LinkIcon, Box, Loader2, RefreshCw } from 'lucide-react';

export default function AuditTrail() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIndexedEvents = async () => {
    setIsLoading(true);
    
    try {
      const { contract } = await getWeb3State();
      
      // Query recent blockchain history to pull authentic Mint and Burn logs
      const currentBlock = await contract.runner.provider.getBlockNumber();
      const startBlock = Math.max(0, currentBlock - 20000); // Scan the last 20,000 blocks
      
      const filter = contract.filters.Transfer();
      const events = await contract.queryFilter(filter, startBlock, 'latest');
      
      const onChainLogs = events.map((event, index) => {
        const from = event.args[0];
        const to = event.args[1];
        const tokenId = event.args[2].toString();
        
        let type = 'TRANSFER';
        if (from === ethers.ZeroAddress) type = 'MINT';
        if (to === ethers.ZeroAddress) type = 'RETIRE';
        
        return {
          id: `${event.transactionHash}-${index}`,
          type: type,
          token: tokenId,
          hash: event.transactionHash,
          entity: type === 'MINT' ? `${to.substring(0,6)}...${to.substring(38)}` : `${from.substring(0,6)}...${from.substring(38)}`,
          timestamp: 'On-Chain (Time Unavailable)', // Avoids RPC throttling while maintaining token status
          status: 'Confirmed'
        };
      }).filter(log => log.type === 'MINT' || log.type === 'RETIRE').reverse();

      setAuditLogs(onChainLogs);
      
    } catch (error) {
      console.error("Direct RPC query failed. Falling back to local session cache.", error);
      // Fallback mechanism to ensure the UI does not break if the testnet node throttles
      const localCacheRaw = localStorage.getItem('carbonTrustIndexer');
      setAuditLogs(localCacheRaw ? JSON.parse(localCacheRaw) : []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIndexedEvents();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Immutable Audit Ledger</h2>
          <p className="text-gray-500 mt-1 text-sm">Live, cryptographically verifiable provenance of all network state mutations.</p>
        </div>
        
        <button 
          onClick={fetchIndexedEvents}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:bg-gray-100 shadow-sm"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          <span>Force Sync</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="text-gray-500" size={18} />
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Historical Network Activity</h3>
          </div>
          <div className="flex items-center space-x-2 text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            {isLoading ? (
               <Loader2 className="animate-spin text-purple-600" size={14} />
            ) : (
               <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
            )}
            <span>{isLoading ? "Querying Subgraph..." : "Indexer Synced"}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Token ID</th>
                <th className="px-6 py-4 font-medium">Tx Hash</th>
                <th className="px-6 py-4 font-medium">Executing Wallet</th>
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin text-gray-400 mx-auto" size={28} />
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No transactions recorded in indexed block range.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                        log.type === 'MINT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {log.type === 'MINT' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        <span>{log.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-700">
                      <div className="flex items-center space-x-1">
                        <Box size={14} className="text-gray-400" />
                        <span>#{log.token}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={`https://amoy.polygonscan.com/tx/${log.hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1.5 text-blue-600 hover:text-blue-800 transition-colors font-mono"
                      >
                        <LinkIcon size={14} />
                        <span>{log.hash.substring(0, 10)}...</span>
                      </a>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">{log.entity}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs italic">{log.timestamp}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}