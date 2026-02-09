"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ResearchTopicsProps {
  onTopicClick?: (topic: string) => void;
  selectedTopic?: string;
}

// Organized by rows to match the exact layout from the image
const topicsByRow = [
  // Row 1: 5 topics
  ["Pitra Dosh", "Vastu", "Kalsarp dosh", "Sun", "Jupiter"],
  // Row 2: 4 topics (centered/offset)
  ["Rahu", "Mercury", "Venus", "Saturn"],
  // Row 3: 5 topics
  ["Ketu", "Moon", "Mars", "Mangal Badh", "Stree Shrap"],
];

// Flattened array for compatibility
const allTopics = topicsByRow.flat();

export const ResearchTopics: React.FC<ResearchTopicsProps> = ({ onTopicClick, selectedTopic }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
      className="mx-auto mt-8 sm:mt-10 max-w-5xl px-4 sm:px-6"
      aria-label="Research topics"
    >
      <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-6">
        {/* Row 1: 5 buttons */}
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-5 w-full">
          {topicsByRow[0].map((topic, index) => {
            const isSelected = selectedTopic?.toLowerCase() === topic.toLowerCase();
            return (
              <motion.button
                key={topic}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05, duration: 0.4 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTopicClick?.(topic)}
                className={cn(
                  "px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-3xl",
                  "border border-[#1e2023] bg-white text-black text-sm sm:text-base font-medium",
                  "transition-all duration-200 hover:shadow-md",
                  "whitespace-nowrap",
                  isSelected && "bg-black text-white border-[#1e2023]",
                )}
                aria-label={`Filter by ${topic}`}
              >
                {topic}
              </motion.button>
            );
          })}
        </div>

        {/* Row 2: 4 buttons (centered - naturally creates staggered effect) */}
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-5 w-full">
          {topicsByRow[1].map((topic, index) => {
            const isSelected = selectedTopic?.toLowerCase() === topic.toLowerCase();
            return (
              <motion.button
                key={topic}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.05, duration: 0.4 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTopicClick?.(topic)}
                className={cn(
                  "px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-3xl",
                  "border border-[#1e2023] bg-white text-black text-sm sm:text-base font-medium",
                  "transition-all duration-200 hover:shadow-md",
                  "whitespace-nowrap",
                  isSelected && "bg-black text-white border-[#1e2023]",
                )}
                aria-label={`Filter by ${topic}`}
              >
                {topic}
              </motion.button>
            );
          })}
        </div>

        {/* Row 3: 5 buttons */}
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-5 w-full">
          {topicsByRow[2].map((topic, index) => {
            const isSelected = selectedTopic?.toLowerCase() === topic.toLowerCase();
            return (
              <motion.button
                key={topic}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.05, duration: 0.4 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTopicClick?.(topic)}
                className={cn(
                  "px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-3xl",
                  "border border-[#1e2023] bg-white text-black text-sm sm:text-base font-medium",
                  "transition-all duration-200 hover:shadow-md",
                  "whitespace-nowrap",
                  isSelected && "bg-black text-white border-[#1e2023]",
                )}
                aria-label={`Filter by ${topic}`}
              >
                {topic}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default ResearchTopics;
