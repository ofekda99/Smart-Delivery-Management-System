const getBaseUrl = () => {
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    return isLocalhost 
        ? 'https://localhost:44333/api' 
        : 'https://smart-delivery-management-system-t6lh.onrender.com/api';
};

export const API_BASE = getBaseUrl();