"use client";

import { X, ExternalLink, Play, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import "./SourceViewer.css";

export default function SourceViewer({ source, onClose, tracker }) {
    const [iframeError, setIframeError] = useState(false);
    const loggedSourceRef = useRef(null);

    // Log source open when source changes
    useEffect(() => {
        if (source && source._id !== loggedSourceRef.current) {
            loggedSourceRef.current = source._id;
            if (tracker) tracker.logActivity('source');
        }
    }, [source, tracker]);

    // Handler for external link clicks
    const handleExternalClick = (type, url) => {
        if (tracker) tracker.logExternalClick(type, url);
    };

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

            case "youtube": {
                let videoId = "";
                try {
                    const urlStr = source.metadata?.url || source.storagePath || "";
                    if (urlStr) {
                        const urlObj = new URL(urlStr);
                        if (urlObj.hostname.includes("youtube.com")) {
                            videoId = urlObj.searchParams.get("v");
                            if (urlObj.pathname.includes("/embed/"))
                                videoId = urlObj.pathname.split("/embed/")[1];
                        } else if (urlObj.hostname.includes("youtu.be")) {
                            videoId = urlObj.pathname.slice(1);
                        }
                        if (!videoId) {
                            const match = urlStr.match(/(?:v=|\/)([\w-]{11})/);
                            if (match) videoId = match[1];
                        }
                    }
                } catch (e) {
                    console.error("Invalid YouTube URL", e);
                }

                const youtubeUrl = source.metadata?.url || source.storagePath || "";
                const thumbnailUrl = videoId
                    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                    : null;

                return (
                    <div className="youtube-viewer">
                        {/* Clickable thumbnail that opens YouTube */}
                        {videoId && (
                            <a
                                href={youtubeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="youtube-thumbnail-link"
                                onClick={() => handleExternalClick('youtube', youtubeUrl)}
                            >
                                <img
                                    src={thumbnailUrl}
                                    alt="YouTube Thumbnail"
                                    className="youtube-thumbnail"
                                    onError={(e) => {
                                        e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                    }}
                                />
                                <div className="youtube-play-overlay">
                                    <div className="youtube-play-btn">
                                        <Play size={32} fill="white" />
                                    </div>
                                    <span className="youtube-play-text">Watch on YouTube</span>
                                </div>
                            </a>
                        )}

                        {/* Transcript section */}
                        {source.metadata?.text && (
                            <div className="extracted-text-container">
                                <h4 className="extracted-text-title">📝 Extracted Transcript</h4>
                                <div className="extracted-text-content">
                                    {source.metadata.text}
                                </div>
                            </div>
                        )}

                        {source.status === "failed" && (
                            <div className="error-message">
                                ⚠️ Transcript extraction failed. The video may not have captions available.
                            </div>
                        )}
                    </div>
                );
            }

            case "url":
            case "website": {
                const displayUrl =
                    source.metadata?.url ||
                    source.storagePath ||
                    source.originalName ||
                    "#";

                return (
                    <div className="website-viewer">
                        {/* Try to show the website in an iframe */}
                        {!iframeError && (
                            <div className="website-iframe-wrapper">
                                <iframe
                                    src={displayUrl}
                                    className="website-frame"
                                    title="Website Viewer"
                                    sandbox="allow-same-origin allow-scripts"
                                    onError={() => setIframeError(true)}
                                    onLoad={(e) => {
                                        // Some sites block iframe silently
                                        try {
                                            const doc = e.target.contentDocument;
                                            if (!doc || !doc.body || doc.body.innerHTML === '') {
                                                setIframeError(true);
                                            }
                                        } catch {
                                            // Cross-origin — iframe loaded but we can't access it (good)
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {/* Link bar */}
                        <div className="source-link-bar">
                            <a
                                href={displayUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="external-link"
                                onClick={() => handleExternalClick('website', displayUrl)}
                            >
                                <Globe size={14} /> Open in New Tab <ExternalLink size={14} />
                            </a>
                        </div>

                        {/* Show extracted text if iframe fails or as supplement */}
                        {(iframeError || !displayUrl.startsWith('http')) && source.metadata?.text && (
                            <div className="extracted-text-container">
                                <h4 className="extracted-text-title">📄 Extracted Content</h4>
                                <div className="extracted-text-content">
                                    {source.metadata.text}
                                </div>
                            </div>
                        )}

                        {source.status === "pending" && (
                            <p className="note">⏳ Content is being extracted...</p>
                        )}
                        {source.status === "failed" && (
                            <div className="error-message">⚠️ Failed to extract content from this website.</div>
                        )}
                    </div>
                );
            }

            case "text":
                return (
                    <div className="text-container">
                        <pre>{source.metadata?.text || "No text content available."}</pre>
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

    const statusBadge = source.status && (
        <span className={`status-badge status-${source.status}`}>
            {source.status === "ingested" ? "✅ Ready" :
                source.status === "pending" ? "⏳ Processing" :
                    source.status === "failed" ? "❌ Failed" : source.status}
        </span>
    );

    return (
        <div className="source-viewer-container">
            <div className="source-viewer-header">
                <div className="source-viewer-title-group">
                    <h3 className="source-viewer-title">
                        {source.originalName || "Source View"}
                    </h3>
                    {statusBadge}
                </div>
                <button className="close-btn" onClick={onClose} title="Close Source">
                    <X size={20} />
                </button>
            </div>

            <div className="source-viewer-content">
                {renderContent()}
            </div>
        </div>
    );
}