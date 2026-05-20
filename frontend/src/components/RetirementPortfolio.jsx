import { useState } from 'react';
import { getWeb3State } from '../utils/web3';
import { ethers } from 'ethers';
import { Flame, Search, ShieldCheck, AlertOctagon, Loader2 } from 'lucide-react';

export default function RetirementPortfolio() {
  const [tokenId, setTokenId] = useState('');
  const [verifiedTokenId, setVerifiedTokenId] = useState(''); // NEW: Locks UI state
  const [assetStatus, setAssetStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState(null);

  const verifyAssetStatus = async () => {
    if (!tokenId) return;
    try {
      setIsProcessing(true);
      setTxHash(null);
      
      const { contract } = await getWeb3State();
      const retiredState = await contract.isRetired(tokenId);
      
      if (retiredState) {
        setAssetStatus('retired');
      } else {
        await contract.ownerOf(tokenId); 
        setAssetStatus('active');
      }
      
      setVerifiedTokenId(tokenId); // LOCK THE STATE FOR THE UI
      
    } catch (error) {
      console.error(error);
      setAssetStatus('not_found');
      setVerifiedTokenId(tokenId);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeRetirement = async () => {
    try {
      setIsProcessing(true);
      const { signer, contract } = await getWeb3State();
      
      // 100 GWEI SLEDGEHAMMER
      const txOverrides = {
        maxPriorityFeePerGas: ethers.parseUnits("100", "gwei"),
        maxFeePerGas: ethers.parseUnits("100", "gwei")
      };

      const transaction = await contract.retireCredit(verifiedTokenId, txOverrides);
      const receipt = await transaction.wait();
      
      setTxHash(receipt.hash);
      setAssetStatus('retired'); 
      
      // --- CLIENT-SIDE INDEXER CACHE ---
      const userAddress = await signer.getAddress();
      
      const newAuditRecord = {
        id: Date.now(),
        type: 'RETIRE',
        token: verifiedTokenId.toString(),
        hash: receipt.hash,
        timestamp: new Date().toLocaleString(),
        entity: `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`,
        status: 'Confirmed'
      };

      const existingCache = JSON.parse(localStorage.getItem('carbonTrustIndexer') || '[]');
      localStorage.setItem('carbonTrustIndexer', JSON.stringify([newAuditRecord, ...existingCache]));

    } catch (error) {
      console.error(error);
      alert("Retirement Execution Failed: Ensure you own this Token ID.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Corporate Retirement Portfolio</h2>
        <p className="text-gray-500">Mathematical elimination of double-counting via immutable cryptographic burning.</p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-8">
        
        <div className="space-y-4">
          <label className="text-sm font-semibold text-gray-700">Query Asset Ledger (Enter Token ID)</label>
          <div className="flex space-x-3">
            <input 
              type="number" 
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="e.g., 0"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-mono"
            />
            <button 
              onClick={verifyAssetStatus}
              disabled={isProcessing || !tokenId}
              className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors disabled:bg-gray-400"
            >
              {isProcessing && assetStatus === null ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
              <span>Verify State</span>
            </button>
          </div>
        </div>

        {/* UI RENDER ENGINE: Now strictly uses verifiedTokenId */}
        {assetStatus === 'active' && (
          <div className="p-6 border border-emerald-200 bg-emerald-50 rounded-xl space-y-6">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="text-emerald-600" size={28} />
              <div>
                <h3 className="text-lg font-bold text-emerald-900">Asset Verified: Active & Liquid</h3>
                <p className="text-sm text-emerald-700">Token ID #{verifiedTokenId} is currently circulating and eligible for corporate offset retirement.</p>
              </div>
            </div>
            
            <button 
              onClick={executeRetirement}
              disabled={isProcessing}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex justify-center items-center space-x-2 shadow-md transition-all"
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Flame size={20} />
                  <span>Execute Irreversible ESG Retirement</span>
                </>
              )}
            </button>
          </div>
        )}

        {assetStatus === 'retired' && (
          <div className="p-6 border border-gray-300 bg-gray-100 rounded-xl flex items-start space-x-4">
            <div className="p-2 bg-gray-300 rounded-full text-gray-600">
              <Flame size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Asset Permanently Neutralized</h3>
              <p className="text-sm text-gray-600 mt-1">Token ID #{verifiedTokenId} has been cryptographically burned. It is mathematically impossible to double-count or resell this offset.</p>
              {txHash && (
                <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline mt-3 inline-block font-mono">
                  View Burn Receipt: {txHash}
                </a>
              )}
            </div>
          </div>
        )}

        {assetStatus === 'not_found' && (
          <div className="p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-lg flex items-center space-x-3">
            <AlertOctagon size={20} />
            <span className="text-sm font-medium">Asset #{verifiedTokenId} not found on the Polygon ledger.</span>
          </div>
        )}

      </div>
    </div>
  );
}