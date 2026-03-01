import GameGrid from '../../components/arena/GameGrid';
import FighterPanel from '../../components/arena/FighterPanel';
import BroadcastPanel from '../../components/arena/BroadcastPanel';
import EventLog from '../../components/arena/EventLog';

export default function BattleRoyaleArena() {
  return (
    <div className="flex-1 flex overflow-hidden p-2 gap-2">
      {/* Left: Game Grid centered */}
      <div className="flex items-center justify-center shrink-0">
        <GameGrid />
      </div>

      {/* Right: Panels fill all remaining space */}
      <div className="flex-1 flex flex-col gap-2 min-w-[280px] overflow-hidden">
        {/* Fighters — takes ~35% */}
        <div className="flex-[3.5] overflow-hidden min-h-0">
          <FighterPanel />
        </div>
        {/* Chat — takes ~35% */}
        <div className="flex-[3.5] overflow-hidden min-h-0">
          <BroadcastPanel />
        </div>
        {/* Event log — takes ~30% */}
        <div className="flex-[3] overflow-hidden min-h-0">
          <EventLog />
        </div>
      </div>
    </div>
  );
}
