"use client";

import { X, ExternalLink } from "lucide-react";
import "./SourceViewer.css";

export default function SourceViewer({ source, onClose }) {
    if (!source) return null;

    const renderContent = () => {
        switch (source.type) {
            case "pdf":
                return (
                    <iframe
                        src={`https://docs.google.com/gview?url=${encodeURIComponent(source.storagePath)}&embedded=true`}
                        className="source-frame"
                        title="PDF Viewer"
                    />
                );

            case "youtube":
                let videoId = "";

                try {
                    const urlStr = source.metadata?.url || source.storagePath || "";
                    if (!urlStr) throw new Error("No URL provided");

                    const urlObj = new URL(urlStr);

                    if (urlObj.hostname.includes("youtube.com")) {
                        videoId = urlObj.searchParams.get("v");

                        if (urlObj.pathname.includes("/embed/")) {
                            videoId = urlObj.pathname.split("/embed/")[1];
                        }
                    } else if (urlObj.hostname.includes("youtu.be")) {
                        videoId = urlObj.pathname.slice(1);
                    }

                    if (!videoId) {
                        const regExp =
                            /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                        const match = urlStr.match(regExp);
                        if (match && match[2].length === 11) {
                            videoId = match[2];
                        }
                    }
                } catch (e) {
                    console.error("Invalid YouTube URL", e);
                }

                return (
                    <div className="youtube-container">
                        {videoId ? (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div className="error-message">Invalid YouTube URL</div>
                        )}
                    </div>
                );

            case "url":
            case "website":
                const displayUrl =
                    source.metadata?.url ||
                    source.storagePath ||
                    source.originalName ||
                    "#";

                return (
                    <div className="url-container">
                        <p>External Website:</p>
                        <a
                            href={displayUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="external-link"
                        >
                            {displayUrl} <ExternalLink size={16} />
                        </a>
                        <p className="note">
                            Websites cannot be embedded directly due to security restrictions.
                            Please open in a new tab.
                        </p>
                    </div>
                );

            case "text":
                return (
                    <div className="text-container">
                        <pre>
                            {source.metadata?.text || "No text content available."}
                        </pre>
                    </div>
                );

            default:
                return (
                    <div className="unsupported-message">
                        Unsupported source type: {source.type}
                    </div>
                );
        }
    };

    return (
        <div className="source-viewer-container">
            <div className="source-viewer-header">
                <h3 className="source-viewer-title">
                    {source.originalName || "Source View"}
                </h3>
                <button
                    className="close-btn"
                    onClick={onClose}
                    title="Close Source"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="source-viewer-content">
                {renderContent()}
            </div>
        </div>
    );
}