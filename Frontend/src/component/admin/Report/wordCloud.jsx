import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js';
import { WordCloudChart, WordCloudController, WordElement } from 'chartjs-chart-wordcloud';
import '../css/adminEnquiry.css';

Chart.register(WordCloudChart, WordCloudController, WordElement);

// List of common stop words
const STOP_WORDS = new Set([
  'the', 'and', 'is', 'in', 'of', 'to', 'a', 'with', 'for', 'on', 'as', 'by', 'an', 'that', 'at', 'it', 'are', 'from', 'or', 'which', 'this', 'be', 'has', 'was', 'were', 'but', 'not', 'can', 'will', 'its', 'they', 'we', 'you', 'he', 'she', 'they', 'i', 'my'
]);

const fetchWordCloudData = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/enquiries');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    
    const wordCount = {};

    data.forEach(enquiry => {
      const words = enquiry.EnquiryDetails
        .toLowerCase()
        .replace(/[.,/#!?$%^&*;:{}=\-_`~()]/g, '') // Remove punctuation
        .split(/\s+/)
        .filter(word => word.length > 0 && !STOP_WORDS.has(word)); // Exclude stop words

      words.forEach(word => {
        if (wordCount[word]) {
          wordCount[word]++;
        } else {
          wordCount[word] = 1;
        }
      });
    });

    // Convert the word count map to an array of objects for Chart.js
    const words = Object.entries(wordCount).map(([text, value]) => ({
      text,
      value
    }));

    // Normalize word sizes
    const maxWordCount = Math.max(...Object.values(wordCount));
    const minFontSize = 10; // Minimum font size in pixels
    const maxFontSize = 100; // Maximum font size in pixels

    const scaledWords = words.map(word => ({
      text: word.text,
      value: minFontSize + (word.value / maxWordCount) * (maxFontSize - minFontSize)
    }));

    return scaledWords;
  } catch (error) {
    console.error('Error fetching word cloud data:', error);
    return [];
  }
};

const WordCloudComponent = () => {
  const [words, setWords] = useState([]);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    fetchWordCloudData().then(data => {
      if (chartInstanceRef.current) {
        // Destroy the existing chart instance
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      
      const config = {
        type: 'wordCloud',
        data: {
          labels: data.map(word => word.text),
          datasets: [
            {
              label: 'Word Cloud',
              data: data.map(word => word.value),
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: false
            },
          }
        }
      };

      // Create the Chart instance and save it in the ref
      chartInstanceRef.current = new Chart(ctx, config);
    });

    // Cleanup function to destroy the chart on component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="wordcloud-container">
        <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default WordCloudComponent;
