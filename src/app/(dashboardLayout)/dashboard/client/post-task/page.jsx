import ClientPostTaskComponent from '@/components/ClientPostTaskComponent';
import React from 'react';
export const metadata = {
  title: "Post New Task",
};
const PostTaskPage = () => {
    return (
        <ClientPostTaskComponent/>
    );
};

export default PostTaskPage;