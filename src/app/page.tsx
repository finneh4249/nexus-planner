import BucketSplitter from '@/components/bucket-splitter';
import ActionHub from '@/components/action-hub';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <main className="flex min-h-full w-full flex-col items-center justify-center p-4 sm:p-8 space-y-8">
      <BucketSplitter />
      <Separator />
      <ActionHub />
    </main>
  );
}
