import React, { useState } from "react";
import { SelectionFormData } from "../types";
import { Search, Loader2, Lightbulb, ChevronDown, ChevronUp, Users, Package } from "lucide-react";

export interface InspirationParams {
  targetAudience?: string;
  productHint?: string;
}

interface InputFormProps {
  onSubmit: (data: SelectionFormData) => void;
  onInspiration: (params: InspirationParams) => void;
  isLoading: boolean;
  isInspirationLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, onInspiration, isLoading, isInspirationLoading }) => {
  const [category, setCategory] = useState("");
  const [style, setStyle] = useState("");

  // Inspiration settings
  const [showInspirationSettings, setShowInspirationSettings] = useState(false);
  const [targetAudience, setTargetAudience] = useState("");
  const [productHint, setProductHint] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category.trim()) {
      onSubmit({ category, style });
    }
  };

  const handleInspiration = () => {
    onInspiration({
      targetAudience: targetAudience.trim() || undefined,
      productHint: productHint.trim() || undefined,
    });
  };

  return (
    <div className="w-full glass p-6 mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label htmlFor="category" className="block text-sm font-semibold text-[#5a6166] mb-2">
            大分類 (Category) <span className="text-red-400">*</span>
          </label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="例如：襪子、手套、露營裝備..."
            className="glass-input w-full px-4 py-3 text-[#3a3f42]"
            required
            disabled={isLoading || isInspirationLoading}
          />
        </div>
        <div className="flex-1 w-full">
          <label htmlFor="style" className="block text-sm font-semibold text-[#5a6166] mb-2">
            店鋪風格/主軸 (Store Style) <span className="text-[#7a8186] text-xs font-normal">(選填)</span>
          </label>
          <input
            id="style"
            type="text"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="例如：日系復古、極簡機能、韓系甜美..."
            className="glass-input w-full px-4 py-3 text-[#3a3f42]"
            disabled={isLoading || isInspirationLoading}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={handleInspiration}
            disabled={isLoading || isInspirationLoading}
            className="glass-btn-amber w-full md:w-auto px-5 py-3 font-medium rounded-xl flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-50"
            title="不知道賣什麼？讓 AI 給你靈感！"
          >
            {isInspirationLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                生成中...
              </>
            ) : (
              <>
                <Lightbulb size={18} />
                找靈感
              </>
            )}
          </button>
          <button
            type="submit"
            disabled={isLoading || isInspirationLoading || !category.trim()}
            className="glass-btn-primary w-full md:w-auto px-6 py-3 font-medium rounded-xl flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                分析中...
              </>
            ) : (
              <>
                <Search size={18} />
                生成結構樹
              </>
            )}
          </button>
        </div>
      </form>

      {/* Inspiration Settings Toggle */}
      <div className="mt-5 pt-4">
        <div className="glass-divider mb-4"></div>
        <button
          type="button"
          onClick={() => setShowInspirationSettings(!showInspirationSettings)}
          className="glass-btn flex items-center gap-2 px-4 py-2 text-sm text-amber-600 font-medium"
          disabled={isLoading || isInspirationLoading}
        >
          {showInspirationSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <Lightbulb size={14} />
          靈感生成進階設定
          {(targetAudience || productHint) && (
            <span className="ml-1 px-2 py-0.5 glass-tag glass-tag-amber text-xs">
              已設定
            </span>
          )}
        </button>

        {showInspirationSettings && (
          <div className="mt-4 glass-inset p-5 space-y-4">
            <p className="text-xs text-amber-600 font-medium">
              設定以下條件後，按「找靈感」可生成更精準的商品建議
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="targetAudience" className="flex items-center gap-1.5 text-sm font-semibold text-[#5a6166] mb-2">
                  <Users size={14} className="text-amber-500" />
                  鎖定目標族群
                  <span className="text-[#7a8186] text-xs font-normal">(選填)</span>
                </label>
                <input
                  id="targetAudience"
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="例如：大學生、貴婦、健身愛好者、新手媽媽..."
                  className="glass-input w-full px-4 py-2.5 text-sm text-[#3a3f42]"
                  disabled={isLoading || isInspirationLoading}
                />
              </div>
              <div>
                <label htmlFor="productHint" className="flex items-center gap-1.5 text-sm font-semibold text-[#5a6166] mb-2">
                  <Package size={14} className="text-amber-500" />
                  鎖定商品方向
                  <span className="text-[#7a8186] text-xs font-normal">(選填)</span>
                </label>
                <input
                  id="productHint"
                  type="text"
                  value={productHint}
                  onChange={(e) => setProductHint(e.target.value)}
                  placeholder="例如：飾品、3C配件、居家用品、寵物用品..."
                  className="glass-input w-full px-4 py-2.5 text-sm text-[#3a3f42]"
                  disabled={isLoading || isInspirationLoading}
                />
              </div>
            </div>
            <p className="text-xs text-[#7a8186]">
              提示：可以只填一個，或兩個都填。留空則隨機生成多元建議。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputForm;
