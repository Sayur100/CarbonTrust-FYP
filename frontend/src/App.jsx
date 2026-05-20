import { useState, useEffect } from 'react';
import { getWeb3State } from './utils/web3';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import MintingHub from './components/MintingHub';
import RetirementPortfolio from './components/RetirementPortfolio';
import AuditTrail from './components/AuditTrail';
import { Wallet, LayoutDashboard, Fingerprint, Flame, FileText, Shield } from 'lucide-react';

export default function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');
  const [userRole, setUserRole] = useState('developer'); // 'developer' or 'buyer'

  // Auto-detect wallet on page load and listen for account changes
  useEffect(() => {
    checkIfWalletIsConnected();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(null); // User disconnected from MetaMask
        }
      });
    }

    // Cleanup listener on unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  // Silently check for existing connection without prompting the MetaMask popup
  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) return;
      
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (error) {
      console.error("Silent wallet connection failed:", error);
    }
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      const { signer } = await getWeb3State();
      const address = await signer.getAddress();
      setWalletAddress(address);
    } catch (error) {
      alert("Connection failed: " + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const navItems = [
    { id: 'analytics', label: 'Macro Analytics', icon: LayoutDashboard, roles: ['developer', 'buyer'] },
    { id: 'minting', label: 'Oracle Minting', icon: Fingerprint, roles: ['developer'] },
    { id: 'retirement', label: 'Asset Retirement', icon: Flame, roles: ['buyer'] },
    { id: 'audit', label: 'Audit Ledger', icon: FileText, roles: ['developer', 'buyer'] }
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(userRole));

  const handleRoleSwitch = (role) => {
    setUserRole(role);
    if (role === 'buyer' && activeTab === 'minting') setActiveTab('analytics');
    if (role === 'developer' && activeTab === 'retirement') setActiveTab('analytics');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('analytics')}>
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">CarbonTrust<span className="text-green-600">.</span></h1>
          </div>

          {/* Role-Based Access Control Switcher */}
          <div className="hidden xl:flex items-center space-x-2 bg-gray-100 p-1 rounded-lg border border-gray-200 ml-4">
            <Shield size={16} className="text-gray-500 ml-2" />
            <button 
              onClick={() => handleRoleSwitch('developer')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${userRole === 'developer' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Project Developer
            </button>
            <button 
              onClick={() => handleRoleSwitch('buyer')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${userRole === 'buyer' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ESG Corporate Buyer
            </button>
          </div>

          <div className="hidden xl:flex space-x-1 ml-8">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === item.id ? 'bg-green-50 text-green-700 border border-green-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button 
          onClick={connectWallet}
          disabled={isConnecting}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            walletAddress 
              ? 'bg-gray-100 text-gray-700 border border-gray-300'
              : 'bg-gray-900 hover:bg-gray-800 text-white shadow-sm'
          }`}
        >
          <Wallet size={18} />
          <span>
            {isConnecting ? "Connecting..." : 
             walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : 
             "Connect MetaMask"}
          </span>
        </button>
      </nav>

      {/* Main Content Area - Using CSS display to persist data state across tabs */}
      <main className="max-w-6xl mx-auto px-8 py-8">
        <div className={activeTab === 'analytics' ? 'block' : 'hidden'}>
          <AnalyticsDashboard />
        </div>
        <div className={activeTab === 'minting' ? 'block' : 'hidden'}>
          <MintingHub />
        </div>
        <div className={activeTab === 'retirement' ? 'block' : 'hidden'}>
          <RetirementPortfolio />
        </div>
        <div className={activeTab === 'audit' ? 'block' : 'hidden'}>
          <AuditTrail />
        </div>
      </main>
    </div>
  );
}