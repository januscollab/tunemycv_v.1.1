
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDevAuth } from '@/contexts/DevAuthContext';
import { featureFlags } from '@/config/featureFlags';

const DevAuthDebugPanel: React.FC = () => {
  if (!featureFlags.DEV_SHOW_DEBUG_INFO) {
    return null;
  }

  const isUsingDevAuth = featureFlags.DEV_BYPASS_AUTH || featureFlags.DEV_AUTO_LOGIN;
  const authHook = isUsingDevAuth ? useDevAuth : useAuth;
  const { user, session, loading } = authHook();

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">🔧 Dev Auth Debug</div>
      <div className="space-y-1">
        <div>Mode: {isUsingDevAuth ? 'DEV AUTH' : 'REAL AUTH'}</div>
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>User: {user ? user.email : 'None'}</div>
        <div>Session: {session ? 'Active' : 'None'}</div>
        <div className="mt-2 pt-2 border-t border-white/20">
          <div>Flags:</div>
          <div className="ml-2">
            <div>BYPASS_AUTH: {featureFlags.DEV_BYPASS_AUTH ? '✅' : '❌'}</div>
            <div>AUTO_LOGIN: {featureFlags.DEV_AUTO_LOGIN ? '✅' : '❌'}</div>
            <div>DEBUG_INFO: {featureFlags.DEV_SHOW_DEBUG_INFO ? '✅' : '❌'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevAuthDebugPanel;
