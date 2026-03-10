// src/pages/errors/ServerError500.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorPageLayout } from '../../components/ui/ErrorPageLayout';

export const ServerError500: React.FC = () => {
    const { t } = useTranslation("common");
    return (
        <ErrorPageLayout
            errorCode="500"
            title={t("errors.serverError.title")}
            description={t("errors.serverError.description")}
        />
    );
};

export default ServerError500;
