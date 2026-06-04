import { useSidebar } from '@/_components/ui/sidebar';
import { useCallback } from 'react';

export function useMobileNavigation() {
    const { isMobile, setOpenMobile } = useSidebar();

    return useCallback(() => {
        if (isMobile) {
            setOpenMobile(false);
        };

        document.body.style.removeProperty('pointer-events');
    }, [isMobile, setOpenMobile]);
}