import React, { useState, useEffect } from "react";
import InputForm, { InspirationParams } from "./components/InputForm";
import TreeVisualizer from "./components/TreeVisualizer";
import { generateMerchandiseTree, generateInspirationCategories } from "./services/geminiService";
import { SelectionFormData, TreeResponse, InspirationResponse } from "./types";
import { Network, AlertCircle, Settings, X, Key, Save, ExternalLink, ThumbsUp, ThumbsDown, Users, Tag, Store, Image } from "lucide-react";

const App: React.FC = () => {
  const [treeData, setTreeData] = useState<TreeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inspiration State
  const [inspirationData, setInspirationData] = useState<InspirationResponse | null>(null);
  const [inspirationLoading, setInspirationLoading] = useState(false);

  // API Key State
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState("");

  // Background Image State
  const [showBackground, setShowBackground] = useState(true);

  useEffect(() => {
    const storedKey = localStorage.getItem("gemini_api_key");
    if (storedKey) {
        setApiKey(storedKey);
        setTempKey(storedKey);
    }
  }, []);

  const handleSaveKey = () => {
    setApiKey(tempKey);
    localStorage.setItem("gemini_api_key", tempKey);
    setShowSettings(false);
  };

  const handleGenerate = async (data: SelectionFormData) => {
    setLoading(true);
    setError(null);
    setInspirationData(null);
    try {
      const result = await generateMerchandiseTree(data.category, data.style, apiKey);
      setTreeData(result);
    } catch (err: any) {
      setError(err.message || "生成選品樹時發生錯誤，請檢查 API Key 或稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  const handleInspiration = async (params: InspirationParams) => {
    setInspirationLoading(true);
    setError(null);
    setTreeData(null);
    try {
      const result = await generateInspirationCategories(apiKey, {
        targetAudience: params.targetAudience,
        productHint: params.productHint,
      });
      setInspirationData(result);
    } catch (err: any) {
      setError(err.message || "生成靈感時發生錯誤，請檢查 API Key 或稍後再試。");
    } finally {
      setInspirationLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!treeData) return;
    const jsonString = JSON.stringify(treeData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `merchandise-tree-${treeData.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen font-sans relative p-4 sm:p-6 lg:p-8">
      {/* Background Blobs */}
      {showBackground && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full blur-3xl opacity-60 animate-blob"></div>
          <div className="absolute top-1/4 -right-20 w-96 h-96 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
          <div className="absolute -bottom-20 right-1/3 w-64 h-64 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full blur-3xl opacity-40 animate-blob animation-delay-3000"></div>
          {/* Orange rings */}
          <div className="absolute top-20 left-1/3 w-40 h-40 border-[20px] border-orange-400 rounded-full opacity-40 blur-sm"></div>
          <div className="absolute bottom-40 right-1/4 w-32 h-32 border-[16px] border-orange-300 rounded-full opacity-50 blur-sm"></div>
        </div>
      )}

      {/* Background Toggle Button */}
      <button
        onClick={() => setShowBackground(!showBackground)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 ${
          showBackground
            ? 'glass-btn-primary'
            : 'glass-btn text-[#5a6166]'
        }`}
        title={showBackground ? '隱藏背景' : '顯示背景'}
      >
        <Image size={18} />
        <span className="text-sm font-medium">{showBackground ? '隱藏背景' : '顯示背景'}</span>
      </button>
      {/* Settings Modal */}
      {showSettings && (
        <div className="glass-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="glass-modal max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowSettings(false)}
                className="glass-icon-btn absolute top-4 right-4 p-2 text-[#5a6166] hover:text-[#3a3f42]"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="glass-sm p-3 text-indigo-600">
                  <Key size={24} />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-[#3a3f42]">API 金鑰設定</h3>
                   <p className="text-sm text-[#5a6166]">配置您的 Google Gemini API Key</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-[#5a6166] mb-2">
                        Gemini API Key
                    </label>
                    <input
                        type="password"
                        value={tempKey}
                        onChange={(e) => setTempKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="glass-input w-full px-4 py-3 text-sm font-mono"
                    />
                    <p className="mt-2 text-xs text-[#7a8186] flex items-center gap-1">
                        <AlertCircle size={12} />
                        金鑰將會儲存在您的瀏覽器本地端 (LocalStorage)
                    </p>
                </div>

                <div className="pt-2">
                     <button
                        onClick={handleSaveKey}
                        className="glass-btn-primary w-full py-3 font-medium rounded-xl flex items-center justify-center gap-2"
                     >
                        <Save size={18} />
                        儲存設定
                     </button>
                </div>

                <div className="glass-divider my-4"></div>
                <div className="flex justify-center">
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
                    >
                        取得 Gemini API Key <ExternalLink size={12} />
                    </a>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <header className="glass sticky top-4 z-30 mb-6 max-w-7xl mx-auto">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="glass-sm p-2.5 text-indigo-600">
              <Network size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#3a3f42]">
                MerchMind
              </h1>
              <p className="text-xs text-[#5a6166] font-medium">
                AI 智能選品結構總監
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
                onClick={() => setShowSettings(true)}
                className={`glass-btn flex items-center gap-2 px-4 py-2 text-sm font-medium ${
                    apiKey
                    ? "text-emerald-600"
                    : "text-[#5a6166]"
                }`}
            >
                <Settings size={14} />
                <span>{apiKey ? "API Key 已設定" : "設定 Gemini API"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto pb-8 min-h-[calc(100vh-10rem)] flex flex-col">
        {/* Input Section */}
        <InputForm onSubmit={handleGenerate} onInspiration={handleInspiration} isLoading={loading} isInspirationLoading={inspirationLoading} />

        {/* Error State */}
        {error && (
          <div className="glass mb-6 p-4 flex items-start gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold">分析失敗</h3>
              <p className="text-sm mt-1 text-red-500">{error}</p>
            </div>
          </div>
        )}

        {/* Visualization Section */}
        <div className={`flex-1 glass-canvas flex flex-col ${inspirationData ? '' : 'overflow-hidden min-h-[700px]'}`}>
          <div className="p-4 flex justify-between items-center">
            <h2 className="font-semibold text-[#3a3f42] flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${inspirationData ? 'bg-amber-400' : 'bg-indigo-500'}`} style={{boxShadow: '0 2px 8px rgba(0,0,0,0.15)'}}></span>
              {treeData ? `選品結構圖：${treeData.name}` : inspirationData ? '商品靈感建議' : "等待生成結構樹..."}
            </h2>
            {treeData && (
              <button
                onClick={handleDownloadJSON}
                className="glass-btn text-sm text-indigo-600 font-medium px-4 py-2"
              >
                下載 JSON
              </button>
            )}
          </div>

          <div className="glass-divider mx-4"></div>

          <div className={`flex-1 ${inspirationData ? '' : 'relative'} p-4`}>
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center glass-modal-overlay z-20 rounded-2xl m-4">
                <div className="glass p-8 flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-[#3a3f42] font-medium animate-pulse">正在建構市場選品邏輯...</p>
                  <p className="text-[#7a8186] text-sm mt-2">分析引流款、流行趨勢與小眾需求</p>
                </div>
              </div>
            ) : inspirationLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center glass-modal-overlay z-20 rounded-2xl m-4">
                <div className="glass p-8 flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-[#3a3f42] font-medium animate-pulse">正在尋找商品靈感...</p>
                  <p className="text-[#7a8186] text-sm mt-2">分析市場趨勢與優缺點</p>
                </div>
              </div>
            ) : treeData ? (
              <div className="flex flex-col h-full gap-4">
                <div className="flex-1 glass-inset-deep overflow-hidden rounded-xl">
                  <TreeVisualizer data={treeData} />
                </div>
                {/* Similar Stores Panel */}
                {treeData.similarStores && (
                  <div className="glass p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="glass-sm p-2 text-indigo-600">
                        <Store size={16} />
                      </div>
                      <h3 className="font-semibold text-[#3a3f42] text-sm">相似品牌/店家參考</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Marketplace Stores */}
                      <div className="glass-inset p-4">
                        <div className="text-xs font-semibold text-orange-600 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          蝦皮/momo 店家
                        </div>
                        <div className="space-y-2">
                          {treeData.similarStores.marketplace.map((store, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-orange-400 mt-0.5">•</span>
                              <div>
                                <span className="text-sm font-medium text-[#3a3f42]">{store.name}</span>
                                <span className="text-xs text-[#7a8186] ml-1.5">({store.platform === 'shopee' ? '蝦皮' : 'momo'})</span>
                                {store.description && (
                                  <p className="text-xs text-[#5a6166] mt-0.5">{store.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Official Brand Stores */}
                      <div className="glass-inset p-4">
                        <div className="text-xs font-semibold text-indigo-600 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          自有品牌官網
                        </div>
                        <div className="space-y-2">
                          {treeData.similarStores.officialBrands.map((store, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-indigo-400 mt-0.5">•</span>
                              <div>
                                <span className="text-sm font-medium text-[#3a3f42]">{store.name}</span>
                                {store.description && (
                                  <p className="text-xs text-[#5a6166] mt-0.5">{store.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : inspirationData ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {inspirationData.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="glass-card p-6"
                  >
                    <h3 className="text-lg font-bold text-[#3a3f42] mb-3">
                      {suggestion.category}
                    </h3>
                    <div className="glass-inset px-3 py-2 mb-4 flex items-center gap-2 text-sm text-[#5a6166]">
                      <Users size={14} />
                      <span>{suggestion.targetAudience}</span>
                    </div>

                    {/* Product Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {suggestion.productTags.map((tag, i) => (
                        <span
                          key={i}
                          className="glass-tag glass-tag-indigo inline-flex items-center gap-1 px-3 py-1 text-xs font-medium"
                        >
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="glass-inset p-3">
                        <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm mb-2">
                          <ThumbsUp size={14} />
                          <span>優點</span>
                        </div>
                        <ul className="space-y-1.5">
                          {suggestion.pros.map((pro, i) => (
                            <li key={i} className="text-sm text-[#5a6166] flex items-start gap-2">
                              <span className="text-emerald-500 mt-1">•</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="glass-inset p-3">
                        <div className="flex items-center gap-1.5 text-red-500 font-semibold text-sm mb-2">
                          <ThumbsDown size={14} />
                          <span>缺點</span>
                        </div>
                        <ul className="space-y-1.5">
                          {suggestion.cons.map((con, i) => (
                            <li key={i} className="text-sm text-[#5a6166] flex items-start gap-2">
                              <span className="text-red-400 mt-1">•</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Reference Stores */}
                      {suggestion.referenceStores && suggestion.referenceStores.length > 0 && (
                        <div className="glass-inset p-3">
                          <div className="flex items-center gap-1.5 text-indigo-600 font-semibold text-sm mb-2">
                            <Store size={14} />
                            <span>參考店家</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {suggestion.referenceStores.map((store, i) => (
                              <span
                                key={i}
                                className="glass-tag glass-tag-indigo inline-flex items-center px-3 py-1 text-xs font-medium"
                              >
                                {store}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="glass p-10 flex flex-col items-center max-w-md">
                  <Network size={64} className="mb-4 text-[#AFB5B8]" />
                  <p className="text-lg font-semibold text-[#3a3f42]">尚未生成數據</p>
                  <p className="text-sm mt-2 text-center text-[#5a6166]">
                    請在上方的表單輸入您想要規劃的商品類別（如：襪子、帽子），
                    AI 將為您生成專業的選品結構樹。
                  </p>
                  <p className="text-sm mt-3 text-center text-amber-600 font-medium">
                    不知道賣什麼？點擊「找靈感」按鈕，AI 會推薦熱門品類！
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
