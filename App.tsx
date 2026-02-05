
import React, { useState, useEffect } from 'react';
import { GameState, RiceImage, RiceStatus, Step } from './types';
import { 
  CollectHUD, 
  LabelHUD,
  ResultHUD,
  DetectiveHUD,
  DoctorHUD
} from './components/GameComponents';
import { Sparkles, Stethoscope, Search, Phone } from 'lucide-react';
import GlobalRiceScene from './components/GlobalRiceScene';

// --- Mock Data Generation ---
const generateRiceData = (count: number, startId = 0): RiceImage[] => {
  return Array.from({ length: count }).map((_, i) => {
    const isHealthy = Math.random() > 0.5;
    return {
      id: `rice-${startId + i}`,
      status: isHealthy ? 'healthy' : 'sick',
      url: '', 
      isCollected: false
    };
  });
};

const App = () => {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>({
    step: 'INTRO',
    aiName: '',
    collection: [],
    trainingProgress: 0,
    accuracy: 0,
    detectiveScore: 0,
    currentEvalIndex: 0,
    optimization: {
      hasPotion: false,
      blockCount: 2,
      learningSpeed: 5,
      isCuring: false
    }
  });

  const [pool, setPool] = useState<RiceImage[]>([]);

  useEffect(() => {
    setPool(generateRiceData(20));
  }, []);

  // --- Actions ---

  const handleNameSubmit = (name: string) => {
    setGameState(prev => ({ ...prev, aiName: name, step: 'COLLECT' }));
  };

  const handleCollect = (status: RiceStatus) => {
    setPool(prev => {
       const idx = prev.findIndex(p => p.status === status && !p.isCollected);
       if (idx === -1) return prev; 
       const newPool = [...prev];
       newPool[idx] = { ...newPool[idx], isCollected: true };
       return newPool;
    });
  };

  const finishCollection = () => {
    const collected = pool.filter(p => p.isCollected);
    setGameState(prev => ({ ...prev, collection: collected, step: 'LABEL' }));
  };

  const handleLabel = (label: RiceStatus) => {
    setGameState(prev => {
      const idx = prev.collection.findIndex(c => c.userLabel === undefined);
      if (idx === -1) return prev;

      const newCollection = [...prev.collection];
      newCollection[idx] = { ...newCollection[idx], userLabel: label };

      const nextIdx = newCollection.findIndex(c => c.userLabel === undefined);
      if (nextIdx === -1) {
        return { ...prev, collection: newCollection, step: 'TRAIN' };
      }
      return { ...prev, collection: newCollection };
    });
  };

  // Auto-progress Training
  useEffect(() => {
    if (gameState.step === 'TRAIN') {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.8; 
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          finishTraining();
        }
        setGameState(prev => ({ ...prev, trainingProgress: progress }));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [gameState.step]);

  const finishTraining = () => {
    const userAccuracy = 0.72; // Initial mediocre accuracy to prompt optimization
    
    // Prepare evaluation data (Mock AI Predictions)
    // Create 5 test cases for the detective phase
    const evalSet = generateRiceData(5, 500).map(r => ({
        ...r, 
        // AI has 70% chance to be right initially
        aiPrediction: Math.random() > 0.3 ? r.status : (r.status === 'healthy' ? 'sick' : 'healthy')
    }));

    setGameState(prev => ({ 
      ...prev, 
      accuracy: Math.floor(userAccuracy * 100), 
      step: 'TEST',
      collection: [...prev.collection, ...evalSet] // Append test set
    }));
  };

  const startDetectivePhase = () => {
     setGameState(prev => ({ ...prev, step: 'EVALUATE', currentEvalIndex: 0, detectiveScore: 0 }));
  };

  const handleDetectiveVerify = (userSaysAiIsRight: boolean) => {
    setGameState(prev => {
        // Find the current test item (it's at the end of collection, offset by index)
        const evalItems = prev.collection.filter(c => c.aiPrediction); // Filter only items with predictions
        const currentItem = evalItems[prev.currentEvalIndex];
        
        const aiIsActuallyRight = currentItem.status === currentItem.aiPrediction;
        const userIsCorrect = userSaysAiIsRight === aiIsActuallyRight;

        const newScore = userIsCorrect ? prev.detectiveScore + 1 : prev.detectiveScore;
        const nextIndex = prev.currentEvalIndex + 1;

        if (nextIndex >= evalItems.length) {
            // Finished Evaluation
            return { 
                ...prev, 
                detectiveScore: newScore, 
                currentEvalIndex: 0, // Reset for safety
                step: 'OPTIMIZE' 
            };
        }

        return {
            ...prev,
            detectiveScore: newScore,
            currentEvalIndex: nextIndex
        };
    });
  };

  // Doctor Phase Actions
  const handleDoctorAction = (action: 'potion' | 'block_add' | 'block_remove' | 'speed', value?: number) => {
      setGameState(prev => {
          const opt = { ...prev.optimization };
          if (action === 'potion') opt.hasPotion = !opt.hasPotion;
          if (action === 'block_add') opt.blockCount = Math.min(5, opt.blockCount + 1);
          if (action === 'block_remove') opt.blockCount = Math.max(1, opt.blockCount - 1);
          if (action === 'speed' && value !== undefined) opt.learningSpeed = value;
          return { ...prev, optimization: opt };
      });
  };

  const startCure = () => {
      setGameState(prev => ({ ...prev, optimization: { ...prev.optimization, isCuring: true }}));
      // Simulate re-training/curing
      setTimeout(() => {
          setGameState(prev => ({ 
              ...prev, 
              accuracy: 96, // High accuracy after optimization
              optimization: { ...prev.optimization, isCuring: false },
              step: 'REWARD'
          }));
      }, 3000);
  };

  return (
    <>
      <GlobalRiceScene 
        gameState={gameState}
        onNameSubmit={handleNameSubmit}
        onCollect={handleCollect}
        onLabel={handleLabel}
      />
      
      {/* 2D HUD Overlays */}
      <div className="fixed inset-0 pointer-events-none z-10 flex flex-col">
        {/* Header */}
        <header className="p-4 flex justify-between items-center pointer-events-auto">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm">
             {gameState.step === 'EVALUATE' ? <Search className="text-purple-600 h-5 w-5" /> :
              gameState.step === 'OPTIMIZE' ? <Stethoscope className="text-pink-600 h-5 w-5" /> :
              <Sparkles className="text-blue-600 h-5 w-5" />}
             
             <span className="font-bold text-gray-800">
                {gameState.step === 'EVALUATE' ? 'AI 侦探训练营' : 
                 gameState.step === 'OPTIMIZE' ? 'AI 小医生工作站' : 
                 'Mind AI'}
             </span>
          </div>

          <div className="flex gap-4 items-center">
             {gameState.aiName && (
                <div className="bg-blue-600/90 text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm">
                  助手: {gameState.aiName}
                </div>
             )}
             
             {/* Call Button - Always visible as requested */}
             <div className="bg-green-500/90 text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm flex items-center gap-2 cursor-pointer hover:bg-green-600 transition-colors">
                <Phone size={16} />
                <span>呼叫 AI 支援</span>
             </div>
          </div>
        </header>

        {/* Step-Specific HUDs */}
        <main className="flex-grow relative">
           {gameState.step === 'COLLECT' && (
             <CollectHUD items={pool} onNext={finishCollection} />
           )}
           
           {gameState.step === 'LABEL' && (
             <LabelHUD remaining={gameState.collection.filter(c => c.userLabel === undefined).length} />
           )}

           {gameState.step === 'TEST' && (
             <ResultHUD 
               accuracy={gameState.accuracy} 
               label="进入侦探训练"
               onNext={startDetectivePhase} 
             />
           )}

           {gameState.step === 'EVALUATE' && (
               <DetectiveHUD 
                 current={gameState.currentEvalIndex + 1} 
                 total={5} 
                 onVerify={handleDetectiveVerify}
               />
           )}

           {gameState.step === 'OPTIMIZE' && (
               <DoctorHUD 
                  state={gameState.optimization}
                  onAction={handleDoctorAction}
                  onCure={startCure}
               />
           )}

           {gameState.step === 'REWARD' && (
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-white/90 p-8 rounded-3xl shadow-2xl text-center pointer-events-auto">
                    <h1 className="text-4xl font-black text-yellow-500 mb-4">完美治愈！</h1>
                    <p className="text-gray-600 text-lg mb-6">AI 模型准确率已提升至 96%</p>
                    <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700">
                        再次挑战
                    </button>
                 </div>
             </div>
           )}
        </main>
      </div>
    </>
  );
};

export default App;
