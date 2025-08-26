export const handleCopyLink = (
    linkToCopy: string,
    setIsCopied: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const origin = window.location.origin;
    const fullUrl = origin + linkToCopy;

    // Check if clipboard API is available
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
            .writeText(fullUrl)
            .then(() => {
                setIsCopied(true);
                setTimeout(() => {
                    setIsCopied(false);
                }, 2000);
            })
            .catch((err) => {
                console.error('Failed to copy: ', err);
            });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = fullUrl;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        } finally {
            document.body.removeChild(textArea);
        }
    }
};
