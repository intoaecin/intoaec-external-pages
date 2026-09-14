import React from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import { getStatusColor } from '@/features/indent/constants/statusColor';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CreateIcon from '@mui/icons-material/Create';
import DescriptionIcon from '@mui/icons-material/Description';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Archive, CircleX } from 'lucide-react';
import { useTranslation } from 'react-i18next';



const getStatusIcon = (status: any) => {
    if (!status) return <ErrorOutlineIcon sx={{ fontSize: '14px' }} />;
    const formattedStatus = String(status).trim().replace(/\s+/g, '_').toUpperCase();
    switch (formattedStatus) {
        case 'COMPLETED':
            return <CheckCircleIcon sx={{ fontSize: '14px' }} />;
        case 'APPROVED':
        case 'ACCEPTED':
        case 'CONVERTED':
        case 'PRICE_UPDATED':
        case 'PAID':
        case 'SUCCESS':
        case 'APPLIED':
        case 'ACTIVE':
            return <ThumbUpAltIcon sx={{ fontSize: '14px' }} />;
        case 'REJECTED':
        case 'DECLINED':
        case 'VOIDED':
        case 'UNPAID':
        case 'OVERDUE':
            return <ThumbDownAltIcon sx={{ fontSize: '14px' }} />;
        case 'ARCHIVED':
            return <Archive size={14} strokeWidth={2} />;
        case 'PENDING':
        case 'PENDING_APPROVAL':
        case 'AWAITING_PAYMENT':
        case 'PARTIALLY_PAID':
        case 'PARTIALLY_APPLIED':
        case 'SNOOZED':
        case 'IN_PROGRESS':
        case 'STARTED':
        case 'READY':
        case 'WARNING':
            return <PendingActionsIcon sx={{ fontSize: '14px' }} />;
        case 'ALERT':
            return <ErrorOutlineIcon sx={{ fontSize: '14px' }} />;
        case 'CANCELLED':
            return <CancelIcon sx={{ fontSize: '14px' }} />;
        case 'RECEIVED':
        case 'RECEIVED_PAYMENT':
            return <CallReceivedIcon sx={{ fontSize: '14px' }} />;
        case 'CREATED':
            return <CreateIcon sx={{ fontSize: '14px' }} />;
        case 'RAISED':
            return <CreateIcon sx={{ fontSize: '14px' }} />;
        case 'DRAFT':
        case 'INVOICE':
            return <DescriptionIcon sx={{ fontSize: '14px' }} />;
        case 'SENT':
        case 'PUBLISHED':
            return <MarkEmailReadIcon sx={{ fontSize: '14px' }} />;
        case 'DELIVERED':
            return <MarkEmailReadIcon sx={{ fontSize: '14px' }} />;
        case 'READ':
            return <CheckCircleIcon sx={{ fontSize: '14px' }} />;
        case 'FAILED':
        case 'CRITICAL':
        case 'ERROR':
            return <ErrorOutlineIcon sx={{ fontSize: '14px' }} />;
        case 'INFO':
        case 'DEFAULT':
            return <InfoOutlinedIcon sx={{ fontSize: '14px' }} />;
        case 'NO':
            return <CircleX size={14} strokeWidth={2} />;
        default:
            return <ErrorOutlineIcon sx={{ fontSize: '14px' }} />;
    }
};

interface StatusLabelProps {
    status: any;
    translationKey?: string;
    customColor?: string;
    customBackground?: string;
    /** When set, replaces the default status-based icon (e.g. Lucide Tag). */
    customIcon?: React.ReactNode;
    /** When set, replaces getTranslation() output for the label text. */
    labelOverride?: React.ReactNode;
}

const StatusLabel: React.FC<StatusLabelProps> = ({
    status,
    translationKey = 'indentContent',
    customColor,
    customBackground,
    customIcon,
    labelOverride,
}) => {
    const theme = useTheme();
    const { t } = useTranslation();

    const colors = getStatusColor(String(status || ''), theme);

    // Normalize status for translation key lookup
    const getTranslation = () => {
        if (!status) return '-';
        const strStatus = String(status);

        // Try direct key first
        const directKey = `${translationKey}.${strStatus}`;
        const translated = t(directKey);
        if (translated !== directKey) return translated;

        // Try camelCase/Upper_case variations
        const normalizedKey = strStatus.replace(/\s+/g, '');
        const camelKey = normalizedKey.charAt(0).toLowerCase() + normalizedKey.slice(1);

        if (t(`${translationKey}.${normalizedKey}`) !== `${translationKey}.${normalizedKey}`) {
            return t(`${translationKey}.${normalizedKey}`);
        }

        if (t(`common.${camelKey}`) !== `common.${camelKey}`) {
            return t(`common.${camelKey}`);
        }

        return strStatus;
    };

    const labelText = labelOverride ?? getTranslation();

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                px: '8px',
                py: '4px',
                borderRadius: '20px',
                width: 'fit-content',
                whiteSpace: 'nowrap',
                fontWeight: '700',
                fontSize: '10px',
                textTransform: 'uppercase',
                backgroundColor: customBackground || (colors.background ? alpha(colors.background, 0.1) : alpha(theme.palette.primary.main, 0.1)),
                color: customColor || (colors.background || theme.palette.primary.main),
            }}
        >
            {customIcon ?? getStatusIcon(status)}
            <Box
                component="span"
                sx={{
                    fontSize: '8px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    lineHeight: 1,
                    height: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    mt: '1px',
                }}
            >
                {labelText}
            </Box>
        </Box>
    );
};

export default StatusLabel;
