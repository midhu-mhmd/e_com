// src/pages/errors/Forbidden403.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorPageLayout } from '../../components/ui/ErrorPageLayout';

export const Forbidden403: React.FC = () => {
    const { t } = useTranslation("common");
    return (
        <ErrorPageLayout
            errorCode="403"
            title={t("errors.forbidden.title")}
            description={t("errors.forbidden.description")}
        />
    );
};

export default Forbidden403;
