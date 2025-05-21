import React from 'react';
import PropTypes from 'prop-types';
import '../assets/styles/animations.css'; // Créez ce fichier CSS

const AnimatedSection = ({ children, animation = 'fade-in', duration = '0.5s', delay = '0s' }) => {
    const style = {
        animationDuration: duration,
        animationDelay: delay,
    };

    return (
        <div className={`animated-section ${animation}`} style={style}>
            {children}
        </div>
    );
};

AnimatedSection.propTypes = {
    children: PropTypes.node.isRequired,
    animation: PropTypes.string, // ex: 'fade-in', 'slide-in-left', 'fade-in-up'
    duration: PropTypes.string,
    delay: PropTypes.string,
};

export default AnimatedSection;