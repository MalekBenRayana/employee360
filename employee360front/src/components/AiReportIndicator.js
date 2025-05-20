import React from 'react';
import { FaFileAlt, FaExclamationCircle } from 'react-icons/fa'; // Import an additional icon for 'no report' state
import '../assets/styles/AiReportIndicator.css'; // Make sure you have this CSS file

const AiReportIndicator = ({ hasReport, onClick }) => {
    // Determine the classes and tooltip text based on whether a report exists
    const indicatorClass = hasReport ? 'ai-report-indicator has-report' : 'ai-report-indicator no-report';
    const tooltipText = hasReport ? 'Voir le rapport AI' : 'Rapport AI non disponible';
    const icon = hasReport ? <FaFileAlt size={20} /> : <FaExclamationCircle size={20} />; // Changed to FaExclamationCircle for no report

    return (
        <button
            className={indicatorClass}
            onClick={onClick}
            title={tooltipText}
            aria-label={tooltipText} // For accessibility
        >
            {icon}
            {/* You could add text here if you want: */}
            {/* {hasReport ? 'Rapport AI' : 'N/A (AI)'} */}
        </button>
    );
};

export default AiReportIndicator;