import { Messenger } from '@/components/messages/messenger';
import { getSession } from '@/lib/auth/session';
import { getThreadsForSupplier } from '@/lib/data/messages';
import { getBuyerDisplayNames } from '@/lib/data/profile';

export default async function SupplierMessagesPage() {
  const session = await getSession();
  const supplierId = session!.supplierProfileId!;
  const [threads, buyerNames] = await Promise.all([getThreadsForSupplier(supplierId), getBuyerDisplayNames()]);

  const messengerThreads = threads.map((t) => ({
    id: t.id,
    counterpartyId: t.buyerId,
    counterpartyName: buyerNames[t.buyerId] ?? 'Buyer',
    lastMessagePreview: t.lastMessagePreview,
    lastMessageAt: t.lastMessageAt,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Messages</h1>
      <Messenger
        threads={messengerThreads}
        currentUserId={session!.user.id}
        counterpartyParam="buyerId"
        startThreadHref="/api/messages/thread"
      />
    </div>
  );
}
