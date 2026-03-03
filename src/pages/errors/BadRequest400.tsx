// src/pages/errors/BadRequest400.tsx
import React from 'react';
import { ErrorPageLayout } from '../../components/ui/ErrorPageLayout';

export const BadRequest400: React.FC = () => {
    return (
        <ErrorPageLayout
            errorCode="400"
            title="Bad Request"
            description="The server could not understand your request due to invalid syntax. Please check the information provided and try again."
        />
    );
};

export default BadRequest400;
