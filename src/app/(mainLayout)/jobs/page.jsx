import PublicJobComponent from '@/components/PublicJobComponent';
import React, { Suspense } from 'react';

export const metadata = {
  title: "Jobs",
};

const JobsPage = () => {
  return (
    <Suspense fallback={<div>Loading jobs...</div>}>
        <PublicJobComponent />
      </Suspense>

  );
};

export default JobsPage;