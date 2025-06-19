import React, { useState } from 'react';
import { ChestReward } from '../types/game';
import { Package, Coins, Gem } from 'lucide-react';
import { getRarityColor } from '../utils/gameUtils';

interface ShopProps {
  coins: number;
  onOpenChest: (cost: number) => ChestReward | null;
}

export const Shop: React.FC<ShopProps> = ({ coins, onOpenChest }) => {
  const [lastReward, setLastReward] = useState<ChestReward | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  const chests = [
    { name: 'Basic Chest', cost: 50, description: 'Common rewards' },
    { name: 'Rare Chest', cost: 150, description: 'Better rewards' },
    { name: 'Epic Chest', cost: 400, description: 'Great rewards' },
    { name: 'Legendary Chest', cost: 1000, description: 'Amazing rewards' },
  ];

  const handleOpenChest = async (cost: number) => {
    setIsOpening(true);
    setLastReward(null);
    
    setTimeout(() => {
      const reward = onOpenChest(cost);
      setLastReward(reward);
      setIsOpening(false);
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 p-4 sm:p-6 rounded-lg shadow-2xl">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Treasure Shop</h2>
        <div className="flex items-center justify-center gap-2 text-yellow-300">
          <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-semibold text-sm sm:text-base">{coins} Coins</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {chests.map((chest, index) => (
          <div key={chest.name} className="bg-black/30 p-3 sm:p-4 rounded-lg border border-yellow-600/30">
            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm sm:text-base truncate">{chest.name}</h3>
                <p className="text-xs sm:text-sm text-gray-300">{chest.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-yellow-300">
                <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-semibold text-sm sm:text-base">{chest.cost}</span>
              </div>
              <button
                onClick={() => handleOpenChest(chest.cost)}
                disabled={coins < chest.cost || isOpening}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded font-semibold transition-all duration-200 text-xs sm:text-sm ${
                  coins >= chest.cost && !isOpening
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-400 hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isOpening ? 'Opening...' : 'Open'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reward Display */}
      {isOpening && (
        <div className="text-center py-6 sm:py-8">
          <div className="animate-spin inline-block w-6 h-6 sm:w-8 sm:h-8 border-4 border-yellow-400 border-t-transparent rounded-full mb-3"></div>
          <p className="text-white font-semibold text-sm sm:text-base">Opening chest...</p>
        </div>
      )}

      {lastReward && !isOpening && (
        <div className="bg-gradient-to-r from-green-900 to-teal-900 p-3 sm:p-4 rounded-lg border border-green-500/50">
          <h3 className="text-white font-bold mb-2 text-center text-sm sm:text-base">Chest Reward!</h3>
          <div className="text-center">
            {lastReward.type === 'gems' ? (
              <div className="flex items-center justify-center gap-2">
                <Gem className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                <span className="text-white font-semibold text-sm sm:text-base">{lastReward.gems} Gems</span>
              </div>
            ) : (
              <div>
                <p className={`font-semibold text-sm sm:text-base ${getRarityColor(lastReward.item!.rarity)}`}>
                  {lastReward.item!.rarity.toUpperCase()}
                </p>
                <p className="text-white font-semibold text-sm sm:text-base">{lastReward.item!.name}</p>
                <p className="text-gray-300 text-xs sm:text-sm">
                  {lastReward.type === 'weapon' 
                    ? `ATK: ${lastReward.item!.baseAtk}` 
                    : `DEF: ${(lastReward.item as any).baseDef}`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};