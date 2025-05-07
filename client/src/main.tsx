import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set page title and meta description
document.title = "Roblox Game Stats Explorer";
const metaDescription = document.createElement("meta");
metaDescription.name = "description";
metaDescription.content = "Explore comprehensive statistics for any Roblox game. View player counts, visits, ratings, and more using our Roblox Game Stats Explorer.";
document.head.appendChild(metaDescription);

// Add Open Graph tags
const ogTags = [
  { property: "og:title", content: "Roblox Game Stats Explorer" },
  { property: "og:description", content: "View detailed statistics for any Roblox game including player counts, visits, ratings and more." },
  { property: "og:type", content: "website" },
  { property: "og:url", content: window.location.href }
];

ogTags.forEach(tag => {
  const ogTag = document.createElement("meta");
  ogTag.setAttribute("property", tag.property);
  ogTag.setAttribute("content", tag.content);
  document.head.appendChild(ogTag);
});

createRoot(document.getElementById("root")!).render(<App />);
