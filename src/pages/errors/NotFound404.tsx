// src/pages/errors/NotFound404.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorPageLayout } from '../../components/ui/ErrorPageLayout';

export const NotFound404: React.FC = () => {
    const { t } = useTranslation("common");
    return (
        <ErrorPageLayout
            errorCode="404"
            title={t("errors.notFound.title")}
            description={t("errors.notFound.description")}
        />
    );
};

export default NotFound404;
