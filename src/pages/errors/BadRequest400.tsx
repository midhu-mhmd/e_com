// src/pages/errors/BadRequest400.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorPageLayout } from '../../components/ui/ErrorPageLayout';

export const BadRequest400: React.FC = () => {
    const { t } = useTranslation("common");
    return (
        <ErrorPageLayout
            errorCode="400"
            title={t("errors.badRequest.title")}
            description={t("errors.badRequest.description")}
        />
    );
};

export default BadRequest400;
