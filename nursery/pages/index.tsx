import 'tailwindcss/tailwind.css';
import { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import ChildCard from '@/components/ChildCard';

export default function Home() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ChildCard />
    </QueryClientProvider>
  );
}