import React, { useState, useEffect } from 'react';
import { RefreshCw, Wifi, WifiOff, CheckCircle2, Database, Users } from 'lucide-react';
import { syncManager, SyncPayload } from '../../utils/syncManager';

interface SyncStatusBadgeProps {
  onManualSync?: () => void;
  compact?: boolean;
  className?: string;
  showDatabaseIndicator?: boolean;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  onManualSync,
  compact = false,
  className = '',
  showDatabaseIndicator = true,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(syncManager.isOnline());
  const [isServerConnected, setIsServerConnected] = useState<boolean>(syncManager.isServerConnected());
  const [activeClientsCount, setActiveClientsCount] = useState<number>(syncManager.getActiveConnections());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncText, setLastSyncText] = useState<string>('En Línea');
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());

  // Listen to network changes, server SSE connection, and sync events
  useEffect(() => {
    const unsubOnline = syncManager.onOnlineChange((online) => {
      setIsOnline(online);
    });

    const unsubServer = syncManager.onServerStatus((connected, clients) => {
      setIsServerConnected(connected);
      if (clients !== undefined) {
        setActiveClientsCount(clients);
      }
    });

    const unsubSync = syncManager.onSync((payload: SyncPayload) => {
      setIsSyncing(true);
      setLastSyncTime(payload.timestamp);
      setLastSyncText('Actualizado');
      setTimeout(() => {
        setIsSyncing(false);
      }, 1200);
    });

    return () => {
      unsubOnline();
      unsubServer();
      unsubSync();
    };
  }, []);

  // Update relative time text periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - lastSyncTime) / 1000);
      if (elapsedSeconds < 10) {
        setLastSyncText(isServerConnected ? 'Base de Datos en Línea' : 'Sincronizado');
      } else if (elapsedSeconds < 60) {
        setLastSyncText(`Hace ${elapsedSeconds}s`);
      } else {
        const mins = Math.floor(elapsedSeconds / 60);
        setLastSyncText(`Hace ${mins}m`);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lastSyncTime, isServerConnected]);

  const handleTriggerSync = () => {
    setIsSyncing(true);
    syncManager.broadcastChange('all');
    if (onManualSync) {
      onManualSync();
    }
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(Date.now());
      setLastSyncText('Sincronizado');
    }, 800);
  };

  if (!isOnline) {
    return (
      <div
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        title="Sin conexión a internet. Los cambios se sincronizarán con la base de datos central al reconectar."
      >
        <WifiOff className="w-3 h-3 text-amber-600" />
        <span>Sin Conexión</span>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        onClick={handleTriggerSync}
        disabled={isSyncing}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition ${
          isServerConnected
            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200'
        } ${className}`}
        title={`Base de Datos Central: ${isServerConnected ? 'Conectada en vivo' : 'Conectando...'}. Dispositivos activos: ${activeClientsCount}. Clic para forzar sincronización.`}
      >
        <Database className="w-3 h-3 text-emerald-600" />
        <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-indigo-600 animate-ping' : 'bg-emerald-500'}`} />
        <span>{isSyncing ? 'Sincronizando...' : isServerConnected ? 'BD Central en Línea' : lastSyncText}</span>
        <RefreshCw className={`w-2.5 h-2.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50/80 border border-emerald-200 text-emerald-900 shadow-2xs ${className}`}>
      <div className="flex items-center space-x-1.5">
        <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isSyncing ? 'animate-ping' : 'animate-pulse'}`} />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="font-extrabold text-[11px]">BD Central Conectada</span>
      </div>

      <span className="text-slate-300">•</span>

      <span className="text-[11px] text-emerald-700 font-medium">
        {isSyncing ? 'Transmitiendo cambios...' : `Sincronización en Tiempo Real (${lastSyncText})`}
      </span>

      <button
        onClick={handleTriggerSync}
        disabled={isSyncing}
        title="Forzar actualización y comprobación con la base de datos central"
        className="p-1 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/60 transition"
      >
        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};
