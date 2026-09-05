import { Messenger } from '@/components/messages/messenger';
import { getSession } from '@/lib/auth/session';
import { getThreadsForBuyer } from '@/lib/data/messages';
import { getAllSuppliers } from '@/lib/data/admin';

export default async function BuyerMessagesPage() {
  const session = await getSession();
  const buyerId = session!.buyerProfileId!;
  const [threads, suppliers] = await Promise.all([getThreadsForBuyer(buyerId), getAllSuppliers()]);
  const supplierNames = Object.fromEntries(suppliers.map((s) => [s.id, s.storeName]));

  const messengerThreads = threads.map((t) => ({
    id: t.id,
    counterpartyId: t.supplierId,
    counterpartyName: supplierNames[t.supplierId] ?? 'Supplier',
    lastMessagePreview: t.lastMessagePreview,
    lastMessageAt: t.lastMessageAt,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Messages</h1>
      <Messenger
        threads={messengerThreads}
        currentUserId={session!.user.id}
        counterpartyParam="supplierId"
        startThreadHref="/api/messages/thread"
      />
    </div>
  );
}
