import { Weapon, Armor, Enemy } from '../types/game';

const weaponNames = {
  common: ['Rusty Sword', 'Wooden Club', 'Stone Axe', 'Iron Dagger'],
  rare: ['Steel Blade', 'Silver Mace', 'Enchanted Bow', 'Crystal Staff'],
  epic: ['Flamebrand', 'Frostbite', 'Thunder Strike', 'Shadow Cleaver'],
  legendary: ['Excalibur', 'Mjolnir', 'Gungnir', 'Durandal'],
};

const armorNames = {
  common: ['Leather Vest', 'Cloth Robe', 'Wooden Shield', 'Iron Helm'],
  rare: ['Chainmail', 'Steel Plate', 'Mystic Cloak', 'Silver Guard'],
  epic: ['Dragon Scale', 'Phoenix Mail', 'Void Armor', 'Crystal Guard'],
  legendary: ['Divine Aegis', 'Eternal Plate', 'Shadowweave', 'Celestial Ward'],
};

const enemyNames = [
  'Goblin Warrior', 'Shadow Wolf', 'Stone Golem', 'Fire Imp',
  'Ice Troll', 'Dark Mage', 'Lightning Drake', 'Void Wraith',
  'Crystal Beast', 'Ancient Dragon', 'Chaos Lord', 'Nightmare King'
];

export const generateWeapon = (): Weapon => {
  const rarities = ['common', 'rare', 'epic', 'legendary'] as const;
  const weights = [50, 30, 15, 5]; // Percentage chances
  const random = Math.random() * 100;
  
  let rarity: typeof rarities[number] = 'common';
  let cumulative = 0;
  
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      rarity = rarities[i];
      break;
    }
  }

  const names = weaponNames[rarity];
  const name = names[Math.floor(Math.random() * names.length)];
  
  const baseAtkMap = { common: 15, rare: 25, epic: 40, legendary: 60 };
  const upgradeCostMap = { common: 5, rare: 10, epic: 20, legendary: 40 };

  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    rarity,
    baseAtk: baseAtkMap[rarity] + Math.floor(Math.random() * 10),
    level: 1,
    upgradeCost: upgradeCostMap[rarity],
  };
};

export const generateArmor = (): Armor => {
  const rarities = ['common', 'rare', 'epic', 'legendary'] as const;
  const weights = [50, 30, 15, 5];
  const random = Math.random() * 100;
  
  let rarity: typeof rarities[number] = 'common';
  let cumulative = 0;
  
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      rarity = rarities[i];
      break;
    }
  }

  const names = armorNames[rarity];
  const name = names[Math.floor(Math.random() * names.length)];
  
  const baseDefMap = { common: 8, rare: 15, epic: 25, legendary: 40 };
  const upgradeCostMap = { common: 5, rare: 10, epic: 20, legendary: 40 };

  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    rarity,
    baseDef: baseDefMap[rarity] + Math.floor(Math.random() * 5),
    level: 1,
    upgradeCost: upgradeCostMap[rarity],
  };
};

export const generateEnemy = (zone: number): Enemy => {
  const name = enemyNames[Math.min(zone - 1, enemyNames.length - 1)];
  const hp = 150 + (zone * 2);
  const atk = zone * 5;
  
  return {
    name,
    hp,
    maxHp: hp,
    atk,
    def: 0,
    zone,
  };
};

export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'text-gray-600';
    case 'rare': return 'text-blue-600';
    case 'epic': return 'text-purple-600';
    case 'legendary': return 'text-yellow-600';
    default: return 'text-gray-600';
  }
};

export const getRarityBorder = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'border-gray-400';
    case 'rare': return 'border-blue-400';
    case 'epic': return 'border-purple-400';
    case 'legendary': return 'border-yellow-400';
    default: return 'border-gray-400';
  }
};