// ai-gen start (claud 3.7 sonnet)
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls the window to the top when the route changes
 * This component should be placed inside the Router component in the application
 */
function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top when pathname changes
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Use 'auto' for instant scrolling without animation
        });
    }, [pathname]);

    return null; // This component doesn't render anything
}

export default ScrollToTop;
// ai-gen end