// src/pages/errors/NotFound404.tsx
import React from 'react';
import { ErrorPageLayout } from '../../components/ui/ErrorPageLayout';

export const NotFound404: React.FC = () => {
    return (
        <ErrorPageLayout
            errorCode="404"
            title="Page Not Found"
            description="Oops! The page you are looking for doesn't exist, has been removed, or is temporarily unavailable."
        />
    );
};

export default NotFound404;
