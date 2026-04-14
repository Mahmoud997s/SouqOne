'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/auth';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type PushStatus = 'unsupported' | 'default' | 'granted' | 'denied' | 'loading';

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>('loading');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return;
    }

    setStatus(Notification.permission as PushStatus);

    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setIsSubscribed(!!sub);
      });
    });
  }, []);

  const subscribe = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission();
      setStatus(permission as PushStatus);
      if (permission !== 'granted') return false;

      const { key } = await apiRequest<{ key: string }>('/notifications/push/vapid-key');
      if (!key) return false;

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key).buffer as ArrayBuffer,
      });

      const json = sub.toJSON();
      await apiRequest('/notifications/push/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });

      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error('Push subscribe failed:', err);
      return false;
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await apiRequest('/notifications/push/unsubscribe', {
          method: 'POST',
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
      return true;
    } catch (err) {
      console.error('Push unsubscribe failed:', err);
      return false;
    }
  }, []);

  return { status, isSubscribed, subscribe, unsubscribe };
}
