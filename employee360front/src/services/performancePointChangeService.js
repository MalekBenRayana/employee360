const API_BASE_URL = 'http://localhost:3000';

/**
 * Récupère tous les points de performance.
 * @returns {Promise<PerformancePointChange[]>}
 * @throws {Error}
 */
export const fetchPerformancePointChanges = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/performance-point-changes`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erreur lors de la récupération des points de performance: ${response.status} - ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Erreur lors de la requête pour les points de performance:", error);
        throw error;
    }
};
