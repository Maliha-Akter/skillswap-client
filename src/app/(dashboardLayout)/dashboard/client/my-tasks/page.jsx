import ClientMyTaskComponent from '@/components/ClientMyTaskComponent';
import React from 'react';

export const metadata = {
  title: "My jobs",
};
const MyTasksPage = () => {
  return (
    <div>
      <ClientMyTaskComponent></ClientMyTaskComponent>
    </div>
  );
};

export default MyTasksPage;