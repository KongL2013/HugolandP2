import { useState, useCallback, useEffect } from 'react';
import { GameState, PlayerStats, Inventory, Enemy, Weapon, Armor, ChestReward } from '../types/game';
import { generateWeapon, generateArmor, generateEnemy } from '../utils/gameUtils';
import AsyncStorage from '../utils/storage';

const STORAGE_KEY = 'hugoland_game_state';

const initialPlayerStats: PlayerStats = {
  hp: 200,
  maxHp: 200,
  atk: 50,
  def: 0,
  baseAtk: 50,
  baseDef: 0,
};

const initialInventory: Inventory = {
  weapons: [],
  armor: [],
  currentWeapon: null,
  currentArmor: null,
};

const initialGameState: GameState = {
  coins: 100,
  gems: 0,
  zone: 1,
  playerStats: initialPlayerStats,
  inventory: initialInventory,
  currentEnemy: null,
  inCombat: false,
  combatLog: [],
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isLoading, setIsLoading] = useState(true);

  // Load game state from storage on mount
  useEffect(() => {
    const loadGameState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          // Ensure we don't load combat state
          setGameState({
            ...parsedState,
            currentEnemy: null,
            inCombat: false,
            combatLog: [],
          });
        }
      } catch (error) {
        console.error('Error loading game state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGameState();
  }, []);

  // Save game state to storage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const saveGameState = async () => {
        try {
          // Don't save combat state
          const stateToSave = {
            ...gameState,
            currentEnemy: null,
            inCombat: false,
            combatLog: [],
          };
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
          console.error('Error saving game state:', error);
        }
      };

      saveGameState();
    }
  }, [gameState, isLoading]);

  const updatePlayerStats = useCallback(() => {
    setGameState(prev => {
      const weaponAtk = prev.inventory.currentWeapon 
        ? prev.inventory.currentWeapon.baseAtk + (prev.inventory.currentWeapon.level - 1) * 10
        : 0;
      const armorDef = prev.inventory.currentArmor 
        ? prev.inventory.currentArmor.baseDef + (prev.inventory.currentArmor.level - 1) * 5
        : 0;

      return {
        ...prev,
        playerStats: {
          ...prev.playerStats,
          atk: prev.playerStats.baseAtk + weaponAtk,
          def: prev.playerStats.baseDef + armorDef,
        },
      };
    });
  }, []);

  const equipWeapon = useCallback((weapon: Weapon) => {
    setGameState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        currentWeapon: weapon,
      },
    }));
    updatePlayerStats();
  }, [updatePlayerStats]);

  const equipArmor = useCallback((armor: Armor) => {
    setGameState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        currentArmor: armor,
      },
    }));
    updatePlayerStats();
  }, [updatePlayerStats]);

  const upgradeWeapon = useCallback((weaponId: string) => {
    setGameState(prev => {
      const weapon = prev.inventory.weapons.find(w => w.id === weaponId);
      if (!weapon || prev.gems < weapon.upgradeCost) return prev;

      const updatedWeapons = prev.inventory.weapons.map(w =>
        w.id === weaponId
          ? { ...w, level: w.level + 1, upgradeCost: Math.floor(w.upgradeCost * 1.5) }
          : w
      );

      const updatedCurrentWeapon = prev.inventory.currentWeapon?.id === weaponId
        ? updatedWeapons.find(w => w.id === weaponId) || null
        : prev.inventory.currentWeapon;

      return {
        ...prev,
        gems: prev.gems - weapon.upgradeCost,
        inventory: {
          ...prev.inventory,
          weapons: updatedWeapons,
          currentWeapon: updatedCurrentWeapon,
        },
      };
    });
    updatePlayerStats();
  }, [updatePlayerStats]);

  const upgradeArmor = useCallback((armorId: string) => {
    setGameState(prev => {
      const armor = prev.inventory.armor.find(a => a.id === armorId);
      if (!armor || prev.gems < armor.upgradeCost) return prev;

      const updatedArmor = prev.inventory.armor.map(a =>
        a.id === armorId
          ? { ...a, level: a.level + 1, upgradeCost: Math.floor(a.upgradeCost * 1.5) }
          : a
      );

      const updatedCurrentArmor = prev.inventory.currentArmor?.id === armorId
        ? updatedArmor.find(a => a.id === armorId) || null
        : prev.inventory.currentArmor;

      return {
        ...prev,
        gems: prev.gems - armor.upgradeCost,
        inventory: {
          ...prev.inventory,
          armor: updatedArmor,
          currentArmor: updatedCurrentArmor,
        },
      };
    });
    updatePlayerStats();
  }, [updatePlayerStats]);

  const openChest = useCallback((chestCost: number): ChestReward | null => {
    if (gameState.coins < chestCost) return null;

    const reward = Math.random();
    let chestReward: ChestReward;

    if (reward < 0.4) {
      // 40% chance for weapon
      const weapon = generateWeapon();
      chestReward = { type: 'weapon', item: weapon };
      setGameState(prev => ({
        ...prev,
        coins: prev.coins - chestCost,
        inventory: {
          ...prev.inventory,
          weapons: [...prev.inventory.weapons, weapon],
        },
      }));
    } else if (reward < 0.7) {
      // 30% chance for armor
      const armor = generateArmor();
      chestReward = { type: 'armor', item: armor };
      setGameState(prev => ({
        ...prev,
        coins: prev.coins - chestCost,
        inventory: {
          ...prev.inventory,
          armor: [...prev.inventory.armor, armor],
        },
      }));
    } else {
      // 30% chance for gems
      const gemAmount = Math.floor(Math.random() * 20) + 10;
      chestReward = { type: 'gems', gems: gemAmount };
      setGameState(prev => ({
        ...prev,
        coins: prev.coins - chestCost,
        gems: prev.gems + gemAmount,
      }));
    }

    return chestReward;
  }, [gameState.coins]);

  const startCombat = useCallback(() => {
    const enemy = generateEnemy(gameState.zone);
    setGameState(prev => ({
      ...prev,
      currentEnemy: enemy,
      inCombat: true,
      playerStats: { ...prev.playerStats, hp: 200 },
      combatLog: [`You encounter a ${enemy.name} in Zone ${enemy.zone}!`],
    }));
  }, [gameState.zone]);

  const attack = useCallback((hit: boolean) => {
    setGameState(prev => {
      if (!prev.currentEnemy || !prev.inCombat) return prev;

      let newCombatLog = [...prev.combatLog];
      let newPlayerHp = prev.playerStats.hp;
      let newEnemyHp = prev.currentEnemy.hp;
      let combatEnded = false;
      let playerWon = false;

      if (hit) {
        // Player hits enemy
        const damage = Math.max(1, prev.playerStats.atk - prev.currentEnemy.def);
        newEnemyHp = Math.max(0, prev.currentEnemy.hp - damage);
        newCombatLog.push(`You deal ${damage} damage to the ${prev.currentEnemy.name}!`);
        
        if (newEnemyHp <= 0) {
          combatEnded = true;
          playerWon = true;
          newCombatLog.push(`You defeated the ${prev.currentEnemy.name}!`);
        }
      } else {
        // Player misses, enemy attacks
        const damage = Math.max(1, prev.currentEnemy.atk - prev.playerStats.def);
        newPlayerHp = Math.max(0, prev.playerStats.hp - damage);
        newCombatLog.push(`You missed! The ${prev.currentEnemy.name} deals ${damage} damage to you!`);
        
        if (newPlayerHp <= 0) {
          combatEnded = true;
          playerWon = false;
          newCombatLog.push(`You were defeated by the ${prev.currentEnemy.name}...`);
        }
      }

      if (combatEnded) {
        if (playerWon) {
          const coinsEarned = prev.zone * 5 + Math.floor(Math.random() * 10);
          newCombatLog.push(`You earned ${coinsEarned} coins!`);
          return {
            ...prev,
            coins: prev.coins + coinsEarned,
            zone: prev.zone + 1,
            currentEnemy: null,
            inCombat: false,
            combatLog: newCombatLog,
          };
        } else {
          return {
            ...prev,
            currentEnemy: null,
            inCombat: false,
            combatLog: newCombatLog,
            playerStats: { ...prev.playerStats, hp: newPlayerHp },
          };
        }
      }

      return {
        ...prev,
        currentEnemy: { ...prev.currentEnemy, hp: newEnemyHp },
        playerStats: { ...prev.playerStats, hp: newPlayerHp },
        combatLog: newCombatLog,
      };
    });
  }, []);

  const resetGame = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setGameState(initialGameState);
    } catch (error) {
      console.error('Error resetting game:', error);
    }
  }, []);

  return {
    gameState,
    isLoading,
    equipWeapon,
    equipArmor,
    upgradeWeapon,
    upgradeArmor,
    openChest,
    startCombat,
    attack,
    resetGame,
  };
};