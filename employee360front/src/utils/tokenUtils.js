export  const getUserIdFromToken = () => {
    const token = localStorage.getItem('access_token');
  
    if (!token) return null;
  
    try {
      const payload = token.split('.')[1]; // On découpe le token pour accéder à la partie payload
      const decodedPayload = JSON.parse(atob(payload)); // Décodage du payload
  
      // On récupère l'ID utilisateur sous la clé "sub"
      return decodedPayload.sub || null;
    } catch (err) {
      console.error("❌ Erreur lors du décodage du token :", err);
      return null;
    }
  };
  