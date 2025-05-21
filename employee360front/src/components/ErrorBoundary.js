// components/ErrorBoundary.js
import React from 'react';
import { Button } from 'react-bootstrap'; // Importez Button si vous utilisez React-Bootstrap

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false, // Indique si une erreur a été capturée
            error: null,     // L'objet erreur capturé
            errorInfo: null  // Des informations supplémentaires sur l'erreur (stack trace, etc.)
        };
    }

    // Cette méthode de cycle de vie est appelée après qu'une erreur a été générée
    // par un composant enfant. Elle met à jour l'état pour déclencher l'affichage
    // de l'UI de fallback.
    static getDerivedStateFromError(error) {
        // Mettez à jour l'état de manière à ce que le prochain rendu affiche l'UI de fallback.
        return { hasError: true };
    }

    // Cette méthode de cycle de vie est appelée après qu'une erreur a été capturée.
    // C'est l'endroit idéal pour logguer l'erreur dans un service de rapport d'erreurs.
    componentDidCatch(error, errorInfo) {
        // Vous pouvez envoyer l'erreur à un service de log comme Sentry, Bugsnag, etc.
        console.error("ErrorBoundary a capturé une erreur : ", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // Vous pouvez rendre n'importe quelle UI de fallback personnalisée ici.
            // Il est recommandé d'offrir une option pour recharger la page ou
            // contacter le support.
            return (
                <div className="container py-5 text-center">
                    <h1 className="text-danger">Quelque chose s'est mal passé !</h1>
                    <p className="text-muted">Nous sommes désolés pour le désagrément. Veuillez réessayer plus tard ou contacter le support si le problème persiste.</p>

                    {/* Afficher les détails de l'erreur seulement en mode développement pour le débogage */}
                    {process.env.NODE_ENV === 'development' && (
                        <details className="text-start mt-4 p-3 bg-light rounded border">
                            <summary className="text-primary">Détails de l'erreur (visible en développement)</summary>
                            <pre className="mt-2 text-wrap small">
                                {this.state.error && this.state.error.toString()}
                                <br />
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                    <Button variant="primary" onClick={() => window.location.reload()} className="mt-4">
                        Recharger la page
                    </Button>
                </div>
            );
        }

        // Si aucune erreur n'a été capturée, le composant rend simplement ses enfants.
        return this.props.children;
    }
}

export default ErrorBoundary;