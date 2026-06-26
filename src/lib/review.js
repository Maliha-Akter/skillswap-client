import React from 'react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

// 💡 Score values for evaluation text keys
export const RATING_VALUES = {
    'Excellent': 5,
    'Good': 4,
    'Average': 3,
    'Poor': 2,
    'Very Poor': 1
};

/**
 * Calculates the average score from a dataset of review objects.
 * @param {Array} reviews - Array of objects containing a .rating string property
 * @returns {number} Calculated decimal score rounded to one decimal point
 */
export const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    
    const totalScore = reviews.reduce((sum, rev) => {
        const score = RATING_VALUES[rev.rating] || 0;
        return sum + score;
    }, 0);

    return parseFloat((totalScore / reviews.length).toFixed(1));
};

/**
 * Renders star icons based on a numeric score value.
 * @param {number} rating - Score value between 0 and 5
 * @param {string} sizeClass - Tailwind typography sizing utility class string
 * @returns {JSX.Element} Composed interactive React element layout
 */
export const renderStars = (rating, sizeClass = "text-sm") => {
    if (rating === 0) {
        return <span className="text-[10px] font-mono text-zinc-600">No ratings yet</span>;
    }

    const starElements = [];
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            starElements.push(<FaStar key={i} className={`text-yellow-400 ${sizeClass}`} />);
        } else if (rating >= i - 0.5) {
            starElements.push(<FaStarHalfAlt key={i} className={`text-yellow-400 ${sizeClass}`} />);
        } else {
            starElements.push(<FaStar key={i} className={`text-zinc-700 ${sizeClass}`} />);
        }
    }

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center">{starElements}</div>
            <span className="text-[10px] font-bold font-mono text-zinc-400 ml-1">{rating}</span>
        </div>
    );
};