import ClientMyTaskDetails from '@/components/ClientMyTaskDetails';
import React from 'react';
export const metadata = {
  title: "My Task Details",
};
const TaskDetailsPage = ({params}) => {
    return (
        <ClientMyTaskDetails params={params}/>
    );
};

export default TaskDetailsPage;