export const handleShareLink = async (title: string, text: string, urlToShare: string) => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: title,
                text: text,
                url: urlToShare
            });
            console.log('Share was successful.');
        } catch (error) {
            console.error('Error sharing:', error);
        }
    } else {
        console.log('Web Share API is not supported in your browser.');
    }
};
