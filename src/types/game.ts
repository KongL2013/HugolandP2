export interface GameState {
  coins: number;
  gems: number;
  zone: number;
  playerStats: PlayerStats;
  inventory: Inventory;
  currentEnemy: Enemy | null;
  inCombat: boolean;
  combatLog: string[];
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  baseAtk: number;
  baseDef: number;
}

export interface Inventory {
  weapons: Weapon[];
  armor: Armor[];
  currentWeapon: Weapon | null;
  currentArmor: Armor | null;
}

export interface Weapon {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  baseAtk: number;
  level: number;
  upgradeCost: number;
}

export interface Armor {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  baseDef: number;
  level: number;
  upgradeCost: number;
}

export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  zone: number;
}

export interface ChestReward {
  type: 'weapon' | 'armor' | 'gems';
  item?: Weapon | Armor;
  gems?: number;
}