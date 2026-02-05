
import React from 'react';
import { RiceImage, OptimizationState } from '../types';
import { MousePointer2, Award, ArrowRight, Check, X, TestTube2, Layers, Gauge, PlayCircle } from 'lucide-react';

// --- HUD Components ---

export const CollectHUD = ({ items, onNext }: { items: RiceImage[], onNext: () => void }) => {
  const healthyCount = items.filter(i => i.isCollected && i.status === 'healthy').length;
  const sickCount = items.filter(i => i.isCollected && i.status === 'sick').length;
  const isReady = healthyCount >= 5 && sickCount >= 5;
  const collectedItems = items.filter(i => i.isCollected);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      {/* Top Bar */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 flex justify-between items-center max-w-2xl mx-auto w-full pointer-events-auto">
         <div className="flex items-center gap-2">
            <MousePointer2 className="text-blue-600" />
            <span className="font-bold text-gray-800">目标: 收集样本</span>
         </div>
         <div className="flex gap-4 text-sm font-bold">
            <span className={healthyCount >= 5 ? "text-green-600" : "text-gray-400"}>健康: {healthyCount}/5</span>
            <span className={sickCount >= 5 ? "text-red-600" : "text-gray-400"}>生病: {sickCount}/5</span>
         </div>
      </div>

      {/* Bottom Inventory */}
      <div className="flex flex-col items-center gap-4 pointer-events-auto">
         {collectedItems.length > 0 && (
          <div className="flex gap-2 bg-black/40 backdrop-blur-md p-2 rounded-xl overflow-x-auto max-w-3xl">
            {collectedItems.slice(-8).map((item, idx) => (
               <div key={idx} className={`w-10 h-10 rounded-full border-2 ${item.status === 'healthy' ? 'bg-green-500 border-green-300' : 'bg-yellow-500 border-yellow-300'}`} />
            ))}
          </div>
         )}
         
         {isReady && (
           <button 
             onClick={onNext}
             className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-xl hover:bg-blue-700 animate-bounce transition-colors"
           >
             数据收集完成 - 下一步
           </button>
         )}
      </div>
    </div>
  );
};

export const LabelHUD = ({ remaining }: { remaining: number }) => (
  <div className="absolute top-24 right-8 pointer-events-none">
    <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-lg border-l-4 border-blue-500">
      <h3 className="font-bold text-gray-700">待标注数据</h3>
      <p className="text-3xl font-black text-blue-600">{remaining}</p>
    </div>
  </div>
);

export const ResultHUD = ({ accuracy, label, onNext }: { accuracy: number, label: string, onNext: () => void }) => {
  return (
    <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4 pointer-events-auto">
         <button onClick={onNext} className="flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-full font-bold shadow-xl hover:bg-purple-700 text-lg transition-all hover:scale-105">
            {label} <ArrowRight size={20} />
         </button>
    </div>
  );
};

export const DetectiveHUD = ({ current, total, onVerify }: { current: number, total: number, onVerify: (v: boolean) => void }) => (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-12">
        <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full mb-6 shadow-md">
            <span className="text-purple-700 font-bold">案件进度: {current} / {total}</span>
        </div>
        
        <div className="flex gap-8 pointer-events-auto">
            <button 
                onClick={() => onVerify(false)}
                className="group flex flex-col items-center gap-2"
            >
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center border-4 border-red-500 shadow-xl group-hover:bg-red-200 transition-colors">
                    <X className="text-red-600 w-10 h-10" />
                </div>
                <span className="font-bold text-white bg-black/40 px-3 py-1 rounded-full backdrop-blur">猜错了</span>
            </button>

            <button 
                onClick={() => onVerify(true)}
                className="group flex flex-col items-center gap-2"
            >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center border-4 border-green-500 shadow-xl group-hover:bg-green-200 transition-colors">
                    <Check className="text-green-600 w-10 h-10" />
                </div>
                <span className="font-bold text-white bg-black/40 px-3 py-1 rounded-full backdrop-blur">猜对了</span>
            </button>
        </div>
    </div>
);

export const DoctorHUD = ({ state, onAction, onCure }: { 
    state: OptimizationState, 
    onAction: (a: any, v?: any) => void,
    onCure: () => void 
}) => (
    <div className="absolute bottom-0 left-0 right-0 h-64 bg-white/90 backdrop-blur-xl border-t-4 border-pink-400 p-6 flex items-center justify-center gap-12 pointer-events-auto shadow-2xl">
        
        {/* Treatment 1: Memory Potion */}
        <div className="flex flex-col items-center gap-2">
            <button 
                onClick={() => onAction('potion')}
                className={`w-20 h-20 rounded-2xl flex items-center justify-center border-4 transition-all ${state.hasPotion ? 'bg-purple-100 border-purple-500 scale-110 shadow-[0_0_20px_rgba(168,85,247,0.5)]' : 'bg-gray-100 border-gray-300 hover:border-purple-300'}`}
            >
                <TestTube2 className={`w-10 h-10 ${state.hasPotion ? 'text-purple-600' : 'text-gray-400'}`} />
            </button>
            <span className="font-bold text-gray-700">记忆药水</span>
            <span className="text-xs text-gray-500">(数据增强)</span>
        </div>

        {/* Treatment 2: Brain Blocks */}
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 border border-gray-300">
                <button onClick={() => onAction('block_remove')} className="w-8 h-8 rounded-full bg-white shadow hover:bg-gray-50 font-bold">-</button>
                <div className="flex gap-1">
                   {Array.from({length: 5}).map((_, i) => (
                       <div key={i} className={`w-2 h-6 rounded-sm ${i < state.blockCount ? 'bg-blue-500' : 'bg-gray-300'}`} />
                   ))}
                </div>
                <button onClick={() => onAction('block_add')} className="w-8 h-8 rounded-full bg-white shadow hover:bg-gray-50 font-bold">+</button>
            </div>
            <span className="font-bold text-gray-700 flex items-center gap-1"><Layers size={14}/> 大脑积木</span>
        </div>

        {/* Treatment 3: Speed Slider */}
        <div className="flex flex-col items-center gap-2 w-48">
            <input 
                type="range" 
                min="1" max="10" 
                value={state.learningSpeed}
                onChange={(e) => onAction('speed', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <span className="font-bold text-gray-700 flex items-center gap-1"><Gauge size={14}/> 学习速度: {state.learningSpeed}</span>
        </div>

        <div className="w-px h-full bg-gray-300 mx-4" />

        {/* Cure Button */}
        <button 
            onClick={onCure}
            disabled={state.isCuring}
            className="flex flex-col items-center gap-2 group disabled:opacity-50"
        >
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-xl group-hover:bg-green-400 transition-transform group-hover:scale-105 border-4 border-green-300">
                <PlayCircle className="text-white w-12 h-12" />
            </div>
            <span className="font-bold text-gray-800 text-lg">开始治疗!</span>
        </button>
    </div>
);
