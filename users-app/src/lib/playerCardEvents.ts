interface PlayerCardUpdateListener {
  (playerId: string, stats: any): void;
}

class PlayerCardEventManager {
  private listeners: PlayerCardUpdateListener[] = [];

  addListener(listener: PlayerCardUpdateListener) {
    this.listeners.push(listener);
  }

  removeListener(listener: PlayerCardUpdateListener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  notifyUpdate(playerId: string, stats: any) {
    this.listeners.forEach(listener => {
      try {
        listener(playerId, stats);
      } catch (error) {
        console.error('Error in player card update listener:', error);
      }
    });
  }
}

export const playerCardEventManager = new PlayerCardEventManager();
