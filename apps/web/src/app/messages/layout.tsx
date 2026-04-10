'use client';

import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/components/auth-guard';
import { Navbar } from '@/components/layout/navbar';
import ConversationsSidebar from '@/features/chat/components/conversations-sidebar';

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInChat = pathname !== '/messages'; // /messages/[id]

  return (
    <AuthGuard>
      <Navbar />
      <main className="pt-[121px] h-screen flex flex-col">
        <div className="flex flex-1 min-h-0 max-w-[1440px] mx-auto w-full border-x border-outline-variant/[0.06]">
          {/* Sidebar — always visible on lg, hidden on mobile when inside a chat */}
          <div className={`w-full lg:w-[380px] shrink-0 bg-surface-container-lowest flex flex-col border-l border-outline-variant/[0.08] ${isInChat ? 'hidden lg:flex' : 'flex'}`}>
            <ConversationsSidebar />
          </div>

          {/* Chat area — hidden on mobile when on /messages, visible when in /messages/[id] */}
          <div className={`flex-1 min-w-0 flex flex-col overflow-hidden relative ${isInChat ? 'flex' : 'hidden lg:flex'}`}>
            {children}
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
