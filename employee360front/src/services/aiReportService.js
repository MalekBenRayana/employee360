const API_BASE_URL = 'http://localhost:3000';

/**

 * @param {number} evaluationResponseId 
 * @returns {Promise<Object|null>}
 */
export const fetchAiReportByResponseId = async (evaluationResponseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai-evaluation-reports/by-response/${evaluationResponseId}`);

    if (response.status === 404) {
      console.warn(`Aucun rapport AI trouvé pour evaluationResponseId: ${evaluationResponseId}`);
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur API: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du rapport AI pour responseId ${evaluationResponseId}:`, error);
    throw error;
  }
};

/**

 * @param {number} evaluateeId - 
 * @returns {Promise<Array<Object>>} 
 */
export const fetchAiReportsByEvaluateeId = async (evaluateeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai-evaluation-reports/by-evaluatee/${evaluateeId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur API: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des rapports AI pour evaluateeId ${evaluateeId}:`, error);
    throw error;
  }
};


/**
 * @param {number} evaluationResponseId
 * @returns {Promise<Object|null>}
 */
export const fetchEvaluationResponseWithForm = async (evaluationResponseId) => {
  try {

    const response = await fetch(`${API_BASE_URL}/evaluation-responses/${evaluationResponseId}?relations=session.form`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json();
      throw new Error(`Erreur API: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();

    if (data.session?.form?.form_structure && typeof data.session.form.form_structure === 'string') {
      data.session.form.form_structure = JSON.parse(data.session.form.form_structure);
    }
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la réponse d'évaluation ${evaluationResponseId}:`, error);
    throw error;
  }
};