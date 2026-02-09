"use client";

import { useState } from "react";
import BlogHero from "@/components/blog/BlogHero";
import ResearchTopics from "@/components/blog/researchtopics";
import BlogGrid from "@/components/blog/BlogGrid";
import type { BlogCardProps } from "@/components/blog/BlogCard";

// Sample blog data - Replace with actual data from CMS/API
const sampleBlogs: BlogCardProps[] = [
  {
    id: "1",
    title: "Stree Dosh",
    image: "/Blogs/blogimg/StreeDosh.webp", // Replace with actual image path
    imageAlt: "Stree Dosh",
    date: new Date("2025-08-03"),
    excerpt:
      "Discover the revolutionary ways Stree Dosh is transforming traditional astrological practices and predictions.",
    author: "Soham Vashist",
    category: "Stree Dosh",
    href: "/research/blogs/BlogPage",
  },
  {
    id: "2",
    title: "Pitra Dosh",
    image: "/Blogs/blogimg/PitraDosh.webp", // Replace with actual image path
    imageAlt: "Pitra Dosh",
    date: new Date("2025-08-03"),
    excerpt: "Learn how Pitra Dosh can be used to improve the accuracy of predictions.",
    author: "Soham Vashist",
    category: "Pitra Dosh",
    href: "/research/blogs/BlogPage",
  },
  {
    id: "3",
    title: "Mangal Badh",
    image: "/Blogs/blogimg/MangalBadh.webp", // Replace with actual image path
    imageAlt: "Mangal Badh",
    date: new Date("2025-08-03"),
    excerpt: "Learn how Mangal Badh can be used to improve the accuracy of predictions.",
    author: "Soham Vashist",
    category: "Mangal Badh",
    href: "/research/blogs/BlogPage",
  },
];

export default function BlogsPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();

  const handleTopicClick = (topic: string) => {
    setSelectedTopic(selectedTopic === topic ? undefined : topic);
  };

  return (
    <main className="min-h-screen bg-white">
      <BlogHero />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ResearchTopics onTopicClick={handleTopicClick} selectedTopic={selectedTopic} />
      </div>
      <BlogGrid blogs={sampleBlogs} selectedTopic={selectedTopic} />
    </main>
  );
}
